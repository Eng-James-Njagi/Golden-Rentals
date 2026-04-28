import AdminNav from "../../components/Admin/AdminNav";


export default function AdminLand() {
  return (
    <AdminNav
      defaultTab="dashboard"
      panels={{
        /*dashboard: <Dashboard />,
        analytics: <Analytics />,
        verification: <VerificationCompliance />,
        account: <AccountSettings />,*/
      }}
    />
  );
}