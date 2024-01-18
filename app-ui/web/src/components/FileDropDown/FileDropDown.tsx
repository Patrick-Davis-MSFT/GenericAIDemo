/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import {useState, useEffect} from 'react';
import { FileListResponse } from "../../api/models";
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import React from 'react';

  
interface FileDropdownProps {
  fileList?: FileListResponse;
  setFile: (fileName: string ) => void;
}
export const FileDropDown: React.FC<FileDropdownProps> = ({ fileList, setFile }) => {
    const [fileOpt, setFileOpt] = useState<IDropdownOption[]>([]); // Update the type of modelOpt
    const [selectedFile, setSelectedFile] = useState<string | number>();

    const ddSelectFile = (option?: IDropdownOption) => {
      if (option && option.key)
      {setSelectedFile(option.key);
        setFile(option.key.toString());}
    }

    useEffect(() => {
        if((!fileOpt || fileOpt.length === 0) && fileList) {
        const temp = fileList.map(i => { return ({key: i.name, text: i.name + " | Size: " + i.size + " Date: " + i.last_modified}) } );
        console.log(temp);
        setFileOpt(temp);
    }
    }, [fileList, fileOpt]);
    return (
      <Dropdown
      placeholder="Select an option"
      label="Avaiable Files"
      options={fileOpt}
      onChange={(_e, option) => ddSelectFile(option)}
    />
    )
}