import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function SettingsPage() {
  // Stryker disable all : placeholder for future implementation
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Settings</h1>
        <p>
          <a href="/settings/requesttypes">Request Types</a>
        </p>
      </div>
    </BasicLayout>
  );
}
