import React from "react";
import {
  Create,
  SimpleForm,
  ArrayInput,
  SimpleFormIterator,
  NumberInput,
  SelectInput,
  TextInput,
} from "react-admin";

import { TR, EN } from "../../translations";
import { REPEAT_CONFIG, CURRENCY } from "../../constants";

const PackageCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <div style={{ border: "1px solid black" }}>
        <div>DEFAULT TAG EKLEME YERI</div>
        <SelectInput
          source="defaultTag.code"
          choices={[{ id: TR, name: "Turkish" }, { id: EN, name: "English" }]}
        />
        <TextInput source="defaultTag.name" />
        <TextInput source="defaultTag.description" />
      </div>
      <TextInput source="reference" />
      <SelectInput
        label="Repeat"
        source="repeatConfig"
        choices={[
          { id: REPEAT_CONFIG.NONE, name: "None" },
          { id: REPEAT_CONFIG.WEEKLY, name: "Weekly" },
          { id: REPEAT_CONFIG.MONTHLY, name: "Monthly" },
          { id: REPEAT_CONFIG.YEARLY, name: "Yearly" },
        ]}
      />
      <TextInput source="image" />
      <NumberInput source="price.amount" />
      <SelectInput
        source="price.currency"
        choices={[
          { id: CURRENCY.TRY, name: "TRY" },
          { id: CURRENCY.USD, name: "USD" },
        ]}
      />
      <NumberInput source="priority" />
      <ArrayInput source="tags">
        <SimpleFormIterator>
          <SelectInput
            source="code"
            choices={[{ id: TR, name: "Turkish" }, { id: EN, name: "English" }]}
          />
          <TextInput source="name" />
          <TextInput source="description" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Create>
);

export default PackageCreate;