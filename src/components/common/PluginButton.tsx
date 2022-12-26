import React, { useEffect, useState } from 'react';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { OpenOutputView } from '../../common/CaseRegistrationUtility';
import { fTimeout } from '../../common/CommonUtility';
import { executePlugin, jesgoPluginColumns } from '../../common/Plugin';
import { jesgoCaseDefine } from '../../store/formDataReducer';

const PAGE_TYPE = {
  PATIENT_LIST: 0,
  TARGET_PATIENT: 1,
};

const PluginButton = (props: {
  pageType: number;
  pluginList: jesgoPluginColumns[];
  getTargetFunction: () => jesgoCaseDefine[];
  setIsLoading: (value: React.SetStateAction<boolean>) => void;
}) => {
  const { pageType, pluginList, getTargetFunction, setIsLoading } = props;
  const [targetPlugins, setTargetPlugins] = useState<jesgoPluginColumns[]>([]);

  useEffect(() => {
    switch (pageType) {
      case PAGE_TYPE.PATIENT_LIST: {
        setTargetPlugins(
          pluginList.filter((p) => p.all_patient && !p.update_db)
        );
        break;
      }
      case PAGE_TYPE.TARGET_PATIENT: {
        setTargetPlugins(
          pluginList.filter(
            (p) => !p.all_patient && !p.target_schema_id && !p.update_db
          )
        );
        break;
      }
      default:
    }
  }, [pluginList]);

  const handlePluginSelect = async (plugin: jesgoPluginColumns) => {
    const auth = localStorage.getItem('is_plugin_executable_select');
    if (auth !== 'true') {
      // eslint-disable-next-line no-alert
      alert('権限がありません');
      return;
    }

    setIsLoading(true);
    await Promise.race([
      fTimeout(2),
      executePlugin(plugin, getTargetFunction()),
    ])
      .then((res) => {
        // eslint-disable-next-line
        OpenOutputView(window, (res as any).anyValue);
      })
      .catch((err) => {
        if (err === 'timeout') {
          alert('操作がタイムアウトしました');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <ButtonToolbar>
      <DropdownButton
        aria-hidden="true"
        bsSize="small"
        title="プラグイン選択"
        key="plugin-select"
        id="dropdown-basic-plugin-select"
      >
        {targetPlugins.map((p) => (
          <MenuItem onSelect={() => handlePluginSelect(p)}>
            {p.plugin_name}
          </MenuItem>
        ))}
      </DropdownButton>
    </ButtonToolbar>
  );
};

export const PatientListPluginButton = (props: {
  pluginList: jesgoPluginColumns[];
  getTargetFunction: () => jesgoCaseDefine[];
  setIsLoading: (value: React.SetStateAction<boolean>) => void;
}) => {
  const { pluginList, getTargetFunction, setIsLoading } = props;
  return PluginButton({
    pageType: PAGE_TYPE.PATIENT_LIST,
    pluginList,
    getTargetFunction,
    setIsLoading,
  });
};

export const TargetPatientPluginButton = (props: {
  pluginList: jesgoPluginColumns[];
  getTargetFunction: () => jesgoCaseDefine[];
  setIsLoading: (value: React.SetStateAction<boolean>) => void;
}) => {
  const { pluginList, getTargetFunction, setIsLoading } = props;
  return PluginButton({
    pageType: PAGE_TYPE.TARGET_PATIENT,
    pluginList,
    getTargetFunction,
    setIsLoading,
  });
};
