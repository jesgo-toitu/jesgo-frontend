import React, { useEffect, useState } from 'react';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import {
  IsNotUpdate,
  OpenOutputView,
} from '../../common/CaseRegistrationUtility';
import { fTimeout } from '../../common/CommonUtility';
import { Const } from '../../common/Const';
import { executePlugin, jesgoPluginColumns } from '../../common/Plugin';
import { jesgoCaseDefine } from '../../store/formDataReducer';
import { reloadState } from '../../views/Registration';

const PAGE_TYPE = {
  PATIENT_LIST: 0,
  TARGET_PATIENT: 1,
};

const PluginButton = (props: {
  pageType: number;
  pluginList: jesgoPluginColumns[];
  getTargetFunction: () => jesgoCaseDefine[];
  setIsLoading: (value: React.SetStateAction<boolean>) => void;
  setReload: (
    value: React.SetStateAction<reloadState>
  ) => void;
}) => {
  const { pageType, pluginList, getTargetFunction, setIsLoading, setReload } =
    props;
  const [targetPlugins, setTargetPlugins] = useState<jesgoPluginColumns[]>([]);

  useEffect(() => {
    switch (pageType) {
      case PAGE_TYPE.PATIENT_LIST: {
        setTargetPlugins(pluginList.filter((p) => p.all_patient));
        break;
      }
      case PAGE_TYPE.TARGET_PATIENT: {
        setTargetPlugins(
          pluginList.filter(
            (p) => !p.all_patient && (!p.target_schema_id || p.update_db)
          )
        );
        break;
      }
      default:
    }
  }, [pluginList]);

  const handlePluginSelect = async (plugin: jesgoPluginColumns) => {
    // 権限振り分け
    const selectAuth = localStorage.getItem('is_plugin_executable_select');
    const updateAuth = localStorage.getItem('is_plugin_executable_update');
    if (
      (plugin.update_db && updateAuth !== 'true') ||
      (!plugin.update_db && selectAuth !== 'true')
    ) {
      // eslint-disable-next-line no-alert
      alert('権限がありません');
      return;
    }

    if (
      pageType === PAGE_TYPE.PATIENT_LIST ||
      IsNotUpdate() ||
      // eslint-disable-next-line no-restricted-globals
      confirm('編集中のデータがありますが、破棄してプラグインを実行しますか？')
    ) {
      setIsLoading(true);
      await Promise.race([
        fTimeout(Const.PLUGIN_TIMEOUT_SEC),
        executePlugin(
          plugin,
          getTargetFunction(),
          undefined,
          setReload,
          setIsLoading
        ),
      ])
        .then((res) => {
          if (!plugin.update_db) {
            // eslint-disable-next-line
            OpenOutputView(window, res);
          }
        })
        .catch((err) => {
          if (err === 'timeout') {
            alert('操作がタイムアウトしました');
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <ButtonToolbar style={{ margin: '1rem' }}>
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
  setReload: (
    value: React.SetStateAction<reloadState>
  ) => void;
}) => {
  const { pluginList, getTargetFunction, setIsLoading, setReload } = props;
  return PluginButton({
    pageType: PAGE_TYPE.PATIENT_LIST,
    pluginList,
    getTargetFunction,
    setIsLoading,
    setReload,
  });
};

export const TargetPatientPluginButton = (props: {
  pluginList: jesgoPluginColumns[];
  getTargetFunction: () => jesgoCaseDefine[];
  setIsLoading: (value: React.SetStateAction<boolean>) => void;
  setReload: (
    value: React.SetStateAction<reloadState>
  ) => void;
}) => {
  const { pluginList, getTargetFunction, setIsLoading, setReload } = props;
  return PluginButton({
    pageType: PAGE_TYPE.TARGET_PATIENT,
    pluginList,
    getTargetFunction,
    setIsLoading,
    setReload,
  });
};
