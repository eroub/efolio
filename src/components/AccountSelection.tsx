import React, { useEffect, useState } from "react";
import http from "../services/http";
import { Account } from "../models/AccountTypes";
import { useAuth } from "../auth/AuthContext";

const AccountSelection: React.FC<{ onSelectAccount: (id: number) => void }> = ({
  onSelectAccount,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]); // Replace 'any' with your account type
  const { auth, setSelectedAccount } = useAuth();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await http.get("/api/users/get-accounts"); // Replace with your API endpoint
        setAccounts(response.data);
        if (response.data[0]?.accountID !== auth.selectedAccount) {
          setSelectedAccount(response.data[0]?.accountID); // Default to the first account
          onSelectAccount(response.data[0]?.accountID);
        }
      } catch (error: any) {
        console.error(error);
      }
    };

    fetchAccounts();
  }, [onSelectAccount, setSelectedAccount, auth.selectedAccount]);

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
