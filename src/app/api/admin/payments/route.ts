import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admins to access this endpoint
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z')
      }
    }

    if (search) {
      where.OR = [
        {
          transactionId: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          booking: {
            bookingNumber: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          booking: {
            user: {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: 'insensitive'
                  }
                },
                {
                  email: {
                    contains: search,
                    mode: 'insensitive'
                  }
                }
              ]
            }
          }
        }
      ]
    }

    // Get payment statistics
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)

    const [
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      monthlyTotal,
      yearlyTotal,
      payments
    ] = await Promise.all([
      // Total payments count
      prisma.payment.count(),

      // Completed payments count
      prisma.payment.count({
        where: { status: 'COMPLETED' }
      }),

      // Pending payments count
      prisma.payment.count({
        where: { status: 'PENDING' }
      }),

      // Failed payments count
      prisma.payment.count({
        where: { status: 'FAILED' }
      }),

      // Monthly total amount
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),

      // Yearly total amount
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startOfYear }
        },
        _sum: { amount: true }
      }),

      // Filtered payments for table
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              car: true,
              inspectionCenter: true,
              timeSlot: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      })
    ])

    // Get total count for pagination
    const totalCount = await prisma.payment.count({ where })

    // Format the payments
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      cmiOrderId: payment.cmiOrderId,
      paymentDate: payment.paymentDate,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      booking: {
        id: payment.booking.id,
        bookingNumber: payment.booking.bookingNumber,
        status: payment.booking.status,
        user: payment.booking.user,
        car: {
          licensePlate: payment.booking.car.licensePlate,
          brand: payment.booking.car.brand,
          model: payment.booking.car.model
        },
        center: payment.booking.inspectionCenter.name,
        timeSlot: {
          date: payment.booking.timeSlot.date.toISOString().split('T')[0],
          startTime: payment.booking.timeSlot.startTime.toTimeString().substring(0, 5),
          endTime: payment.booking.timeSlot.endTime.toTimeString().substring(0, 5)
        }
      }
    }))

    const stats = {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      monthlyRevenue: monthlyTotal._sum.amount || 0,
      yearlyRevenue: yearlyTotal._sum.amount || 0
    }

    return NextResponse.json({
      payments: formattedPayments,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching admin payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
