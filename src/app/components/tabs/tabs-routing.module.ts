import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'map',
        loadChildren: () =>
          import('../../pages/map/map.module').then((m) => m.MapPageModule),
      },
      {
        path: 'tab2',
        loadChildren: () =>
          import('../../pages/tab2/tab2.module').then((m) => m.Tab2PageModule),
      },
      {
        path: 'tab3',
        loadChildren: () =>
          import('../../pages/tab3/tab3.module').then((m) => m.Tab3PageModule),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../../pages/settings/settings.module').then(
            (m) => m.SettingsPageModule
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/map',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/map',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
