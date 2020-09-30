/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCheckedAccount = /* GraphQL */ `
  mutation CreateCheckedAccount(
    $input: CreateCheckedAccountInput!
    $condition: ModelcheckedAccountConditionInput
  ) {
    createCheckedAccount(input: $input, condition: $condition) {
      id
      accountID
      createdAt
      updatedAt
    }
  }
`;
export const updateCheckedAccount = /* GraphQL */ `
  mutation UpdateCheckedAccount(
    $input: UpdateCheckedAccountInput!
    $condition: ModelcheckedAccountConditionInput
  ) {
    updateCheckedAccount(input: $input, condition: $condition) {
      id
      accountID
      createdAt
      updatedAt
    }
  }
`;
export const deleteCheckedAccount = /* GraphQL */ `
  mutation DeleteCheckedAccount(
    $input: DeleteCheckedAccountInput!
    $condition: ModelcheckedAccountConditionInput
  ) {
    deleteCheckedAccount(input: $input, condition: $condition) {
      id
      accountID
      createdAt
      updatedAt
    }
  }
`;
export const createAlertItem = /* GraphQL */ `
  mutation CreateAlertItem(
    $input: CreateAlertItemInput!
    $condition: ModelalertItemConditionInput
  ) {
    createAlertItem(input: $input, condition: $condition) {
      id
      Alert
      School
      Date
      createdAt
      updatedAt
    }
  }
`;
export const updateAlertItem = /* GraphQL */ `
  mutation UpdateAlertItem(
    $input: UpdateAlertItemInput!
    $condition: ModelalertItemConditionInput
  ) {
    updateAlertItem(input: $input, condition: $condition) {
      id
      Alert
      School
      Date
      createdAt
      updatedAt
    }
  }
`;
export const deleteAlertItem = /* GraphQL */ `
  mutation DeleteAlertItem(
    $input: DeleteAlertItemInput!
    $condition: ModelalertItemConditionInput
  ) {
    deleteAlertItem(input: $input, condition: $condition) {
      id
      Alert
      School
      Date
      createdAt
      updatedAt
    }
  }
`;
