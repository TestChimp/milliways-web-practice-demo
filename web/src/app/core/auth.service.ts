import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { AuthSession, DemoUser } from './models';
import { emitProductEvent } from './rum';

const SESSION_KEY = 'milliways_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly session = signal<AuthSession | null>(this.loadSession());
  readonly authLoading = signal(false);
  readonly authError = signal<string | null>(null);

  get user(): DemoUser | null {
    return this.session()?.user ?? null;
  }

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  isAuthenticated(): boolean {
    return this.session() !== null;
  }

  async signIn(email: string, password: string): Promise<boolean> {
    this.authLoading.set(true);
    this.authError.set(null);
    try {
      const session = await firstValueFrom(this.api.signIn(email, password));
      this.persistSession(session);
      emitProductEvent('signed-in');
      return true;
    } catch (err) {
      this.authError.set(this.messageFrom(err));
      emitProductEvent('sign-in-failed', { 'error.kind': this.statusOf(err) === 401 ? 'invalid_credentials' : 'other' });
      return false;
    } finally {
      this.authLoading.set(false);
    }
  }

  async signUp(email: string, password: string): Promise<boolean> {
    this.authLoading.set(true);
    this.authError.set(null);
    try {
      const session = await firstValueFrom(this.api.signUp(email, password));
      this.persistSession(session);
      emitProductEvent('signed-up');
      return true;
    } catch (err) {
      this.authError.set(this.messageFrom(err));
      emitProductEvent('sign-up-failed', { 'error.kind': this.statusOf(err) === 409 ? 'email_taken' : 'other' });
      return false;
    } finally {
      this.authLoading.set(false);
    }
  }

  signOut(): void {
    localStorage.removeItem(SESSION_KEY);
    this.session.set(null);
    this.authError.set(null);
    this.router.navigate(['/sign-in']);
  }

  private persistSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.session.set(session);
  }

  private loadSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }

  private statusOf(err: unknown): number | undefined {
    return err && typeof err === 'object' && 'status' in err ? (err as { status?: number }).status : undefined;
  }

  private messageFrom(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { error?: string } }).error;
      if (body?.error) return body.error;
    }
    return 'Request failed';
  }
}
