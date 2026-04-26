import { Routes } from '@angular/router';
import { AddTransactionComponent } from './components/add-transaction/add-transaction';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './auth/auth-guard';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { ForgotPasswordComponent } from './components/login/forgot-password';
import { UpdatePasswordComponent } from './components/login/update-password';


export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, pathMatch: 'full' },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'update-password', component: UpdatePasswordComponent },
    { path: 'signup', component: SignupComponent, pathMatch: 'full'},
    { path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate: [authGuard] },
    { path: 'add-transaction', component: AddTransactionComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];