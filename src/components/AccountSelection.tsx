import React, { useEffect, useState } from "react";
import http from "../services/http";
import { Account } from "../models/AccountTypes";
import { useAuth } from "../auth/AuthContext";

const AccountSelection: React.FC<{ onSelectAccount: (id: number) => void }> = ({
  onSelectAccount,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]); // Replace 'any' with your account type
  const { auth, setSelectedAccount } = useAuth();

  // Only fetch accounts when auth changes and there's no selected account.
  useEffect(() => {
    if (auth.isAuthenticated && auth.selectedAccount === null) {
      const fetchAccounts = async () => {
        try {
          const response = await http.get("/api/users/get-accounts");
          setAccounts(response.data);
          // Only set the selected account if it hasn't been set already
          if (response.data.length > 0) {
            setSelectedAccount(response.data[0].accountID);
            onSelectAccount(response.data[0].accountID);
          }
        } catch (error: any) {
          console.error(error);
        }
      };

      fetchAccounts();
    }
  }, [auth, onSelectAccount, setSelectedAccount]);

  return (
    <select
      value={auth.selectedAccount!}
      onChange={(e) => {
        const newAccountID = parseInt(e.target.value, 10);
        setSelectedAccount(newAccountID);
        onSelectAccount(newAccountID);
      }}
    >
      {accounts.map((account: Account) => (
        <option key={account.accountID} value={account.accountID}>
          {account.accountName}
        </option>
      ))}
    </select>
  );
};

export default AccountSelection;
