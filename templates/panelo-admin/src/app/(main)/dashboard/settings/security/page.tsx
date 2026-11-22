import { ActiveSessions } from "./_components/active-sessions";
import { LoginHistory } from "./_components/login-history";
import { PasswordForm } from "./_components/password-form";
import { TwoFactorCard } from "./_components/two-factor-card";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PasswordForm />
      <TwoFactorCard />
      <ActiveSessions />
      <LoginHistory />
    </div>
  );
}
