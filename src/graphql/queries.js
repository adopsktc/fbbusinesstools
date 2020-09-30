/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getCheckedAccount = /* GraphQL */ `
  query GetCheckedAccount($id: ID!) {
    getCheckedAccount(id: $id) {
      id
      accountID
      createdAt
      updatedAt
    }
  }
`;
export const listCheckedAccounts = /* GraphQL */ `
  query ListCheckedAccounts(
    $filter: ModelcheckedAccountFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCheckedAccounts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        accountID
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getAlertItem = /* GraphQL */ `
  query GetAlertItem($id: ID!) {
    getAlertItem(id: $id) {
      id
      Alert
      School
      Date
      createdAt
      updatedAt
    }
  }
`;
export const listAlertItems = /* GraphQL */ `
  query ListAlertItems(
    $filter: ModelalertItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAlertItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        Alert
        School
        Date
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
