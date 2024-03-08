/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-inner-declarations */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react';
import { AOAIListResponse, AOAISetting, DeploymentListResponse } from "../../api/models";
import { getAOAIService, getDeployments, getDeploymentsWService } from '../../api';
import { ServiceDropDown } from '../../components/AOAIServiceDropdown/AOAIServiceDropdown';
import React from 'react';
import { 
    Stack,
    Text, } from '@fluentui/react';
import { ModelDropDown } from '../../components/ModelDropDown/ModelDropDown';
import { AOAICall } from '../../components/AOAICall/AOAICall';


export default function promptFlow() {

    const [selAOAIService, setSelAOAIService] = useState<AOAISetting>();
    const [serviceList, setServiceList] = useState<AOAIListResponse>();
    const [deploymentListResponse, setDeploymentListResponse] =
      useState<DeploymentListResponse>();
    const [selectedDeployment, setSelectedDeployment] = useState<string>();
    const [callType, setCallType] = useState<string>();
    const [callAPI, setCallAPI] = useState<string>();

    useEffect(() => {
        if (!serviceList) {
          async function fetchData() {
            const res = await getAOAIService();
            console.log(res);
            setServiceList(res);
          }
          fetchData();
        }
      }, [serviceList]);

      const getResourceGroup = (serviceId: string) => {
        const parts = serviceId.split('/');
        const resourceGroup = parts[4];
        return resourceGroup;
      }

      useEffect(() => {
        setSelectedDeployment("");
        if (!deploymentListResponse && selAOAIService && selAOAIService.id && selAOAIService.name) {
          async function fetchData() {
            if(selAOAIService?.id && selAOAIService?.name){
            const res = await getDeploymentsWService(getResourceGroup(selAOAIService.id), selAOAIService.name);
            console.log(res);
            setDeploymentListResponse(res);
            }
          }
          fetchData();
        }
      }, [deploymentListResponse, selAOAIService, selAOAIService?.name]);

    return (
            <div>
      <Stack>
        <Stack.Item align="center">
          <Text variant="mega" style={{ color: "black" }}>
            Prompt Flow Demo
          </Text>
        </Stack.Item>
      </Stack>
      <Stack tokens={{ childrenGap: 10, padding: 25 }}>
        <Stack.Item>
         <h2 style={{ color: "black" }}>
            1){" "}
            {selAOAIService ? (
              <span>Service Selected: {selAOAIService.name} ({selAOAIService.id})</span>
            ) : (
              "Pick an AOAI Service"
            )}
          </h2>
          <ServiceDropDown serviceList={serviceList} setAOAIService={setSelAOAIService} />
        </Stack.Item>
        <Stack.Item>
          <h2 style={{ color: "black" }}>
            2){" "}
            {selectedDeployment ? (
              <span>Model Selected: {selectedDeployment}</span>
            ) : (
              " Pick A Model"
            )}
          </h2>
          <ModelDropDown
            aoaiModel={deploymentListResponse}
            setSelDep={setSelectedDeployment}
          />
        </Stack.Item>
        <AOAICall setCallType={setCallType} setCallAPI={setCallAPI} />
        </Stack>
        </div>
    )
}   