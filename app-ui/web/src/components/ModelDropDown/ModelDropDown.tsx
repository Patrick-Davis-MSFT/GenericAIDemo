/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import {useState, useEffect} from 'react';
import { DeploymentListResponse } from "../../api/models";
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import React from 'react';

  
interface ModelDropdownProps {
  aoaiModel?: DeploymentListResponse;
  setSelDep: (deployment: string ) => void;
}
export const ModelDropDown: React.FC<ModelDropdownProps> = ({ aoaiModel, setSelDep }) => {
    const [modelOpt, setModelOpt] = useState<IDropdownOption[]>([]); // Update the type of modelOpt
    const [selectedDeployment, setSelectedDeployment] = useState<string | number>();

    const ddSelectDeployment = (option?: IDropdownOption) => {
      if (option && option.key)
      {setSelectedDeployment(option.key);
      setSelDep(option.key.toString());}
    }

    useEffect(() => {
        if((!modelOpt || modelOpt.length === 0) && aoaiModel) {
        const temp = aoaiModel.map(i => { return ({key: i.name, text: "Name: \"" + i.name + "\" | Model Type: " + i.model + " Version: " + i.version}) } );
        console.log(temp);
        setModelOpt(temp);
    }
    }, [aoaiModel, modelOpt]);
    return (
      <Dropdown
      placeholder="Select an option"
      label="Azure OpenAI Models"
      options={modelOpt}
      onChange={(e, option) => ddSelectDeployment(option)}
    />
    )
}