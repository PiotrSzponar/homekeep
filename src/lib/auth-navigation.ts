interface AuthNavigationUser {
  id?: string | null;
}

export function shouldRedirectRootToDashboard(user: AuthNavigationUser | null | undefined): boolean {
  return Boolean(user?.id);
}

export function shouldRedirectAuthPageToDashboard(user: AuthNavigationUser | null | undefined): boolean {
  return Boolean(user?.id);
}
