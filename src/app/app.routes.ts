import { Routes } from '@angular/router';
import { AddTransactionComponent } from './components/add-transaction/add-transaction';
import { DashboardComponent } from './components/dashboard/dashboard';


export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
    { path: 'add-transaction', component: AddTransactionComponent },
    { path: '**', redirectTo: '' }
];