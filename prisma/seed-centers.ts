import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const inspectionCenters = [
  {
    name: "Centre d'Inspection Casablanca Nord",
    nameAr: "مركز فحص الدار البيضاء الشمال",
    nameEn: "Casablanca North Inspection Center",
    address: "Zone Industrielle Ain Sebaâ, Rue 12",
    addressAr: "المنطقة الصناعية عين السبع، شارع 12",
    addressEn: "Ain Sebaâ Industrial Zone, Street 12",
    city: "Casablanca",
    latitude: 33.6156,
    longitude: -7.5370,
    phone: "+212 522 123 456",
    email: "casablanca.nord@visite-sri3a.ma",
    isActive: true,
    services: ["Contrôle technique automobile", "Véhicules légers", "Véhicules utilitaires"],
    workingHours: {
      monday: "08:00-18:00",
      tuesday: "08:00-18:00",
      wednesday: "08:00-18:00",
      thursday: "08:00-18:00",
      friday: "08:00-18:00",
      saturday: "08:00-16:00",
      sunday: "Fermé"
    }
  },
  {
    name: "Centre d'Inspection Rabat Centre",
    nameAr: "مركز فحص الرباط المركز",
    nameEn: "Rabat Central Inspection Center",
    address: "Avenue Mohammed V, Agdal",
    addressAr: "شارع محمد الخامس، أكدال",
    addressEn: "Mohammed V Avenue, Agdal",
    city: "Rabat",
    latitude: 34.0150,
    longitude: -6.8326,
    phone: "+212 537 654 321",
    email: "rabat.centre@visite-sri3a.ma",
    isActive: true,
    services: ["Contrôle technique automobile", "Véhicules légers", "Motos"],
    workingHours: {
      monday: "08:30-18:30",
      tuesday: "08:30-18:30",
      wednesday: "08:30-18:30",
      thursday: "08:30-18:30",
      friday: "08:30-18:30",
      saturday: "09:00-17:00",
      sunday: "Fermé"
    }
  },
  {
    name: "Centre d'Inspection Marrakech",
    nameAr: "مركز فحص مراكش",
    nameEn: "Marrakech Inspection Center",
    address: "Route de Casablanca, Sidi Ghanem",
    addressAr: "طريق الدار البيضاء، سيدي غانم",
    addressEn: "Casablanca Road, Sidi Ghanem",
    city: "Marrakech",
    latitude: 31.6295,
    longitude: -7.9811,
    phone: "+212 524 987 654",
    email: "marrakech@visite-sri3a.ma",
    isActive: true,
    services: ["Contrôle technique automobile", "Véhicules légers", "Véhicules lourds"],
    workingHours: {
      monday: "08:00-17:30",
      tuesday: "08:00-17:30",
      wednesday: "08:00-17:30",
      thursday: "08:00-17:30",
      friday: "08:00-17:30",
      saturday: "08:00-16:00",
      sunday: "Fermé"
    }
  },
  {
    name: "Centre d'Inspection Tanger",
    nameAr: "مركز فحص طنجة",
    nameEn: "Tangier Inspection Center",
    address: "Zone Franche, Gzenaya",
    addressAr: "المنطقة الحرة، كزناية",
    addressEn: "Free Zone, Gzenaya",
    city: "Tanger",
    latitude: 35.7595,
    longitude: -5.8340,
    phone: "+212 539 456 789",
    email: "tanger@visite-sri3a.ma",
    isActive: true,
    services: ["Contrôle technique automobile", "Véhicules légers", "Véhicules utilitaires", "Import/Export"],
    workingHours: {
      monday: "08:00-18:00",
      tuesday: "08:00-18:00",
      wednesday: "08:00-18:00",
      thursday: "08:00-18:00",
      friday: "08:00-18:00",
      saturday: "08:00-15:00",
      sunday: "Fermé"
    }
  },
  {
    name: "Centre d'Inspection Fès",
    nameAr: "مركز فحص فاس",
    nameEn: "Fez Inspection Center",
    address: "Route de Meknès, Sidi Brahim",
    addressAr: "طريق مكناس، سيدي إبراهيم",
    addressEn: "Meknes Road, Sidi Brahim",
    city: "Fès",
    latitude: 34.0181,
    longitude: -5.0078,
    phone: "+212 535 789 123",
    email: "fes@visite-sri3a.ma",
    isActive: true,
    services: ["Contrôle technique automobile", "Véhicules légers", "Motos"],
    workingHours: {
      monday: "08:30-17:30",
      tuesday: "08:30-17:30",
      wednesday: "08:30-17:30",
      thursday: "08:30-17:30",
      friday: "08:30-17:30",
      saturday: "09:00-16:00",
      sunday: "Fermé"
    }
  },
  {
    name: "Centre d'Inspection Agadir",
    nameAr: "مركز فحص أكادير",
    nameEn: "Agadir Inspection Center",
    address: "Zone Industrielle Tassila",
    addressAr: "المنطقة الصناعية تاسيلة",
    addressEn: "Tassila Industrial Zone",
    city: "Agadir",
    latitude: 30.4278,
    longitude: -9.5981,
    phone: "+212 528 321 654",
    email: "agadir@visite-sri3a.ma",
    isActive: true,
    services: ["Contrôle technique automobile", "Véhicules légers", "Véhicules agricoles"],
    workingHours: {
      monday: "08:00-17:00",
      tuesday: "08:00-17:00",
      wednesday: "08:00-17:00",
      thursday: "08:00-17:00",
      friday: "08:00-17:00",
      saturday: "08:00-15:00",
      sunday: "Fermé"
    }
  }
]

async function seedCenters() {
  try {
    console.log('Starting to seed inspection centers...')

    // Delete existing centers
    await prisma.inspectionCenter.deleteMany()
    console.log('Deleted existing centers')

    // Create new centers
    for (const center of inspectionCenters) {
      await prisma.inspectionCenter.create({
        data: center
      })
      console.log(`Created center: ${center.name}`)
    }

    console.log('Successfully seeded inspection centers!')
  } catch (error) {
    console.error('Error seeding centers:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedCenters()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedCenters }
