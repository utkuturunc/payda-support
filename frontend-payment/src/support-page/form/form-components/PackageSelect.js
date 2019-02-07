import React, { useContext } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Form, Select } from "antd";

import { TranslationContext } from "../../../translations";

const query = gql`
  query AllPackages($sortOrder: String, $sortField: String) {
    allPackages(sortOrder: $sortOrder, sortField: $sortField) {
      id
      defaultTag {
        code
        name
        description
      }
      tags {
        code
        name
        description
      }
    }
  }
`;

const PackageSelect = props => {
  const { translate } = useContext(TranslationContext);

  return (
    <Query
      query={query}
      variables={{ sortOrder: "DESC", sortField: "priority" }}
    >
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error!</p>;

        return (
          <Form.Item style={{ width: "100%", marginRight: 10 }}>
            {props.getFieldDecorator("packageId", {
              rules: [
                {
                  required: true,
                  message: translate("packageid_validation_error"),
                },
              ],
            })(
              <Select placeholder={translate("select_package")} size="large">
                {data.allPackages.map(
                  ({ id, defaultTag: { name, description } }) => (
                    <Select.Option key={id} value={id}>
                      {name} - {description}
                    </Select.Option>
                  ),
                )}
              </Select>,
            )}
          </Form.Item>
        );
      }}
    </Query>
  );
};

export default PackageSelect;
