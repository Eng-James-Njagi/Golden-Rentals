import ListerNav from "../../components/ListerNav";
import AccountSettings from "../../components/Lister/Accountsetting"
import AddListing from '../../components/Lister/AddListing'
export default function ListerLand() {
  return (
    <>
      <ListerNav
        defaultTab="listings"
        panels={{
          account: <AccountSettings />,
          add: <AddListing/>
         /* listings: <YourListingsComponent />,
          analytics: <YourAnalyticsComponent />,
          add: <YourAddListingComponent />,
          account: <YourAccountComponent />,*/
        }}
      />
    </>
  );
}