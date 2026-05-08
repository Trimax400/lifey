import { Routes } from '@angular/router';
import { AddTransactionComponent } from './components/transaction/add-transaction/add-transaction';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './auth/auth-guard';
import { guestGuard } from './auth/guest-guard';
import { LoginComponent } from './components/auth/login/login';
import { SignupComponent } from './components/auth/signup/signup';
import { ForgotPasswordComponent } from './components/auth/login/forgot-password';
import { UpdatePasswordComponent } from './components/auth/login/update-password';
import { Transactions } from './components/transaction/transactions/transactions';
import { EditTransaction } from './components/transaction/edit-transaction/edit-transaction';
import { Profile } from './components/settings/profile/profile';


export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, pathMatch: 'full', canActivate: [guestGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [guestGuard] },
    { path: 'update-password', component: UpdatePasswordComponent },
    { path: 'signup', component: SignupComponent, pathMatch: 'full', canActivate: [guestGuard] },
    { path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate: [authGuard] },
    { path: 'add-transaction', component: AddTransactionComponent, canActivate: [authGuard] },
    { path: 'edit-transaction/:id', component: EditTransaction, canActivate: [authGuard] },
    { path: 'transactions', component: Transactions, canActivate: [authGuard] },
    { path: 'profile', component: Profile, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];