import ListerNav from "../../components/ListerNav";
import AccountSettings from "../../components/Lister/Accountsetting"
export default function ListerLand() {
  return (
    <>
      <ListerNav
        defaultTab="listings"
        panels={{
          account: <AccountSettings />
         /* listings: <YourListingsComponent />,
          analytics: <YourAnalyticsComponent />,
          add: <YourAddListingComponent />,
          account: <YourAccountComponent />,*/
        }}
      />
    </>
  );
}