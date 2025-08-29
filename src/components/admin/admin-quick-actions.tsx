import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Calendar,
  Users,
  Building2,
  FileText,
  Settings
} from 'lucide-react'

export function AdminQuickActions() {
  const quickActions = [
    {
      title: 'Nouveau centre',
      description: 'Ajouter un centre d\'inspection',
      href: '/admin/centers/new',
      icon: Building2,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Gérer créneaux',
      description: 'Configurer les horaires',
      href: '/admin/time-slots',
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Voir utilisateurs',
      description: 'Gestion des comptes',
      href: '/admin/users',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Rapports',
      description: 'Générer des rapports',
      href: '/admin/reports',
      icon: FileText,
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Paramètres',
      description: 'Configuration système',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
        <CardDescription>
          Accès rapide aux fonctionnalités d'administration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <div className={`p-2 rounded-md mr-3 ${action.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
