/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { useState, useEffect } from "react";
import { AOAIListResponse, AOAISetting } from "../../api/models";
import { Dropdown, IDropdownOption } from "@fluentui/react/lib/Dropdown";
import React from "react";

interface ServiceDropDownProps {
  serviceList?: AOAIListResponse;
  setAOAIService: (aoaiService: AOAISetting) => void;
}
export const ServiceDropDown: React.FC<ServiceDropDownProps> = ({
  serviceList,
  setAOAIService,
}) => {
  const [serviceOpt, setServiceOpt] = useState<IDropdownOption[]>([]); // Update the type of modelOpt
  const [selAOAIService, setSelAOAIService] = useState<string | number>();

  const ddSelectFile = (option?: IDropdownOption) => {
    if (option && option.key) {
      setSelAOAIService(option.key);
      const tmp = serviceList?.filter((i) => {
        return i.name === option.key;
      });
      if (tmp && tmp[0]) {
        const tmp2: AOAISetting = {
          id: tmp[0].id,
          name: tmp[0].name,
          kind: tmp[0].kind,
          sku: tmp[0].sku,
        };
        setAOAIService(tmp2);
      }
    }
  };

  useEffect(() => {
    if ((!serviceOpt || serviceOpt.length === 0) && serviceList) {
      const temp = serviceList.map((i) => {
        return {
          key: i.name,
          text: i.name + " | id: " + i.id + " | kind: " + i.kind + " | sku: " + i.sku,
        };
      });
      console.log(temp);
      setServiceOpt(temp);
    }
  }, [serviceList, serviceOpt]);

  return (
    <Dropdown
      placeholder="Select an option"
      label="Avaiable Services"
      options={serviceOpt}
      onChange={(_e, option) => ddSelectFile(option)}
    />
  );
};
