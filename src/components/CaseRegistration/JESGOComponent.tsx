import React, { useEffect, useRef, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Label, Tooltip, OverlayTrigger, Glyphicon } from 'react-bootstrap';
import './JESGOComponent.css';
import './JESGOFieldTemplete.css';
import { WidgetProps } from '@rjsf/core';
import { JSONSchema7Type, JSONSchema7 } from 'json-schema'; // eslint-disable-line import/no-unresolved
import { IconButton } from './RjsfDefaultComponents';
import { Const } from '../../common/Const';
import { makeStyles } from '@mui/styles';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JESGOComp {
  // "jesgo:required"用ラベル
  export const TypeLabel = (props: { requireType: string[]; pId: string }) => {
    const require = ['JSOG', 'JSGOE'];
    const { requireType, pId } = props;

    let style = 'default';
    return (
      <>
        {require.map((type: string) => {
          if (type === 'JSGOE') {
            style = 'info';
          }

          return (
            requireType.includes(type) && (
              <Label
                className="label-type"
                bsStyle={style}
                key={`${pId}_label${type}`}
              >
                {type}
              </Label>
            )
          );
        })}
      </>
    );
  };

  // "description"用ラベル
  export const DescriptionToolTip = (props: { descriptionText: string }) => {
    const { descriptionText } = props;
    if (!descriptionText) return null;

    const tooltip = (
      <Tooltip>
        <div className="description-tooptip">
          {/* <br>,<br/>タグを改行に置き換え */}
          {descriptionText.split(/<br>|<br\/>/).map((item: string) => (
            <>
              {item}
              <br />
            </>
          ))}
        </div>
      </Tooltip>
    );

    return (
      <OverlayTrigger placement="right" overlay={tooltip}>
        <Glyphicon glyph="question-sign" />
      </OverlayTrigger>
    );
  };

  /**
   * 標準DateWidget
   * ※年に6桁入ってしまう問題の回避のため上限を設定
   * @param props
   * @returns
   */
  export const CustomDateWidget = (props: WidgetProps) => {
    const {
      registry: {
        widgets: { BaseInput },
      },
    } = props;

    return (
      <BaseInput
        type="date"
        min={Const.INPUT_DATE_MIN}
        max={Const.INPUT_DATE_MAX()}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  };

  /**
   * 標準TextareaWidget
   * ・既存のTextareaWidgetを流用
   * ・props.options.rowsが正の数なら入力行数分コントロールを拡張、
   *   負の数なら絶対値を高さに設定、入力でそれを超える場合はスクロールバー表示
   * @param props
   * @returns
   */
  export const CustomTextareaWidget = (props: WidgetProps) => {
    const {
      id,
      options,
      placeholder,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value,
      required,
      disabled,
      readonly,
      autofocus,
      onChange,
      onBlur,
      onFocus,
    } = props;

    const isFixedHeight = Math.sign(options.rows as number) < 0;
    const rows = Math.abs(options.rows as number);

    const calcTextAreaHeight = (val: string) => {
      let rowsHeight = rows;
      if (val) {
        const inputRowsNum = val.split('\n').length;
        if (inputRowsNum > rows) {
          rowsHeight = inputRowsNum;
        }
      }
      return rowsHeight;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value === '' ? options.emptyValue : e.target.value);
    };

    return (
      <textarea
        id={id}
        className="form-control"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value={value || ''}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autofocus}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        rows={isFixedHeight ? rows : calcTextAreaHeight(value)}
        onBlur={onBlur && ((event) => onBlur(id, event.target.value))}
        onFocus={onFocus && ((event) => onFocus(id, event.target.value))}
        onChange={handleInputChange}
      />
    );
  };

  /**
   * 単位付きのTextWidget
   * @param props
   * @returns
   */
  export const WithUnits = (props: WidgetProps) => {
    const { registry, schema } = props;
    const { BaseInput } = registry.widgets;
    // 普通のtextWidgetを返す
    const units = schema.units;

    return (
      <div className="with-units-div">
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <BaseInput {...props} />
        {units && <span>{`（${units}）`}</span>}
      </div>
    );
  };

  /** Typeが複数あるTextWidget */
  export const MultiTypeTextBox = (props: WidgetProps) => {
    const { registry, schema } = props;
    const { BaseInput } = registry.widgets;
    // TODO validationの判定は必要
    const oneOfs = schema.oneOf as JSONSchema7[];
    let units = '';
    oneOfs.forEach((oneOf: JSONSchema7) => {
      // 単位があったらそちらを表示
      if (oneOf.units) {
        units = oneOf.units;
      }
    });

    if (units) {
      // 単位付きのTextWidgetを返す
      schema.units = units;
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <WithUnits {...props} />;
    }

    return <BaseInput {...props} />; // eslint-disable-line react/jsx-props-no-spreading
  };

  /** 選択と入力ができるTextWidget */
  export const DatalistTextBox = (props: WidgetProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { schema, id, onChange, value } = props;
    const selectItems: JSONSchema7Type[] = [];
    const oneOfs = schema.oneOf as JSONSchema7[];
    let units = '';
    oneOfs.forEach((oneOf: JSONSchema7) => {
      if (oneOf.type === 'string' && oneOf.enum) {
        selectItems.push(...oneOf.enum);
      }

      // 単位があったらそちらを表示
      if (oneOf.units) {
        units = oneOf.units;
      }
    });
    if (!selectItems) return null;

    // TODO 他のSelectとスタイルを合わせる必要あり
    // TODO これだとサジェストされちゃうので普通のコンボボックスに置き換えが必要
    return (
      <div key={id} className="with-units-div">
        <input
          className="form-control input-text"
          type="text"
          list={`datalist-${id}`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={value}
        />
        <datalist id={`datalist-${id}`}>
          {selectItems.map((item: JSONSchema7Type) => {
            const itemValue = item ?? '';
            return (
              <option
                key={`selectList-item-${itemValue.toString()}`}
                className="datalist-option"
                value={itemValue.toString()}
              >
                {itemValue.toString()}
              </option>
            );
          })}
        </datalist>
        {units && <span>{`（${units}）`}</span>}
      </div>
    );
  };

  /**
   * 階層表示のドロップダウンリスト
   * @param props
   * @returns
   */
  export const LayerDropdown = (props: WidgetProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { id, schema, onChange, value } = props;
    const selectItems = schema.oneOf as JSONSchema7[];
    if (!selectItems) {
      return null;
    }

    // selectの選択肢を作成
    const createSelectItem = (
      item: JSONSchema7,
      level = 0
    ): JSX.Element | null => {
      // 最上位のグループタイトル
      const title = item.title ?? '';
      const constItem = item.const as JSONSchema7Type;

      // 全角空白でインデントしているように見せる
      const INDENT_SPACE = '　';
      let indent = '';
      for (let i = 0; i < level; i += 1) {
        indent += INDENT_SPACE;
      }
      return (
        <>
          {title && (
            <option
              key={`select-grp-${title}`}
              label={`${indent}${title}`}
              disabled
              className="layer-dropdown-group-title"
            />
          )}
          {(item.oneOf as JSONSchema7[])?.map((oneOfItem: JSONSchema7) =>
            createSelectItem(oneOfItem, level + 1)
          )}
          {(item.enum as JSONSchema7Type[])?.map((subItem: JSONSchema7Type) => {
            // array,object型以外を表示
            if (
              subItem != null &&
              ['string', 'number', 'boolean'].includes(typeof subItem)
            ) {
              const itemValue = subItem?.toString() ?? '';
              return (
                <option key={`select-item-${itemValue}`} value={`${itemValue}`}>
                  {`${indent + INDENT_SPACE}${itemValue}`}
                </option>
              );
            }
            return null;
          })}
          {constItem && (
            <option
              key={`select-item-${constItem.toString()}`}
              value={`${constItem.toString()}`}
            >
              {`${indent}${constItem.toString()}`}
            </option>
          )}
        </>
      );
    };

    return (
      // TODO こちらもReact-Bootstrapを使いたいが、onChangeがうまく設定できない。
      <select
        className="form-control input-text"
        id={id}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
          onChange(event.target.value)
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value={value}
      >
        {/* 未選択用の空のリストを作成 */}
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <option key="select-item-empty" value="" />

        {selectItems.map((item: JSONSchema7) => createSelectItem(item, 0))}
      </select>
    );
  };

  type ComboItemDefine = {
    title?: string;
    label?: string;
    value?: any;
    level: number;
    groupId: number;
  };

  /**
   * 階層表示可能なコンボボックス(フリー入力可)
   * @param props
   * @returns
   */
  export const LayerComboBox = (props: WidgetProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { id, schema, onChange, value } = props;

    if (!schema.anyOf) return null;

    const anyOfItems = schema.anyOf as JSONSchema7[];
    if (!anyOfItems) {
      return null;
    }

    const oneOfItems = anyOfItems.find((p) => p.oneOf) as JSONSchema7;
    if (!oneOfItems.oneOf) {
      return null;
    }

    const comboOnChange = (
      e: React.SyntheticEvent<Element, Event>,
      val: any
    ) => {
      if (
        val &&
        typeof val === 'object' &&
        Object.keys(val).find((p) => p === 'label')
      ) {
        onChange(val.label);
      } else {
        const convertVal = val || '';

        onChange(convertVal);
      }
    };

    // コンボボックスのアイテム一覧
    const comboItemList: ComboItemDefine[] = [];

    let nowGroupId = 0;

    // selectの選択肢を作成
    const createSelectItem = (
      items: JSONSchema7[],
      level: number,
      parentGroupId?: number
    ) => {
      items.forEach((schemaItem) => {
        const newComboItem: ComboItemDefine = {
          label: '',
          value: '',
          title: '',
          level,
          groupId: parentGroupId ?? 0,
        };
        const constItem = schemaItem.const;

        if (constItem) {
          // const (通常の選択肢)
          newComboItem.value = constItem.toString();
          newComboItem.label = schemaItem.title
            ? schemaItem.title
            : constItem.toString();
          comboItemList.push(newComboItem);
        } else if (schemaItem.title) {
          // 見出し用
          newComboItem.title = schemaItem.title;
          nowGroupId += 1;
          newComboItem.groupId = nowGroupId;
          comboItemList.push(newComboItem);

          if (schemaItem.enum) {
            schemaItem.enum.forEach((enumVal) => {
              if (typeof enumVal === 'string') {
                comboItemList.push({
                  label: enumVal,
                  value: enumVal,
                  level: level + 1,
                  groupId: nowGroupId,
                });
              }
            });
          } else if (schemaItem.oneOf) {
            // oneOfの入れ子
            createSelectItem(
              schemaItem.oneOf as JSONSchema7[],
              level + 1,
              nowGroupId
            );
          }
        }
      });
    };

    // comboItemListを生成
    createSelectItem(oneOfItems.oneOf as JSONSchema7[], 0);

    const comboComponent = useRef<HTMLDivElement>(null);

    // リストの内容からコンボボックスの幅計算
    useEffect(() => {
      let comboWidth = 200; // デフォルト200px

      // 一時的にdivに描画して幅を取得する

      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.top = '-30000px'; // 画面の見えないところへ飛ばす
      div.style.left = '-30000px';
      div.style.whiteSpace = 'pre'; // 折り返し禁止

      let textList = comboItemList.map((item) => {
        let str = item.title ? item.title : item.label ?? '';
        str = `${''.padStart(item.level, '　')}${str}`;
        return str;
      });
      if (textList.length > 0) {
        // リストの中で最大長の選択肢を取得
        textList = textList.sort((f, s) => s.length - f.length);
        const maxLengthStr = textList[0];
        div.innerHTML = maxLengthStr;
        document.body.appendChild(div); // bodyに追加して描画

        // divの幅を取得。マージンなどを考慮して補正かける
        const tmpWidth = div.clientWidth + 60;
        if (tmpWidth > comboWidth) {
          comboWidth = tmpWidth;
        }

        // 一時的なdivは削除
        div.parentElement?.removeChild(div);
      }

      // コンボボックスのwidth設定
      if (comboComponent.current) {
        comboComponent.current.style.width = `${comboWidth}px`;
      }
    }, []);

  //   const useStyles = makeStyles(theme => ({
  //     btn: {
  //        "&:hover fieldset": {
  //            borderColor: "blue !important"
  //        },
  //     },
  
  // }));

    return (
      <Autocomplete
        key={`${id}-autocomplete`}
        id={`${id}-autocomplete`}
        disableClearable
        disableListWrap
        freeSolo
        handleHomeEndKeys={false}
        ref={comboComponent}
        value={value}
        inputValue={value}
        onChange={comboOnChange}
        onInputChange={comboOnChange}
        options={comboItemList}
        renderInput={(params) => (
          <TextField
            {...params}
            className="input-text"
            label=""
            key={`${id}-combotext`}
            id={`${id}-combotext`}
          />
        )}
        renderOption={(renderProps, option: ComboItemDefine) => {
          const indent = ''.padStart(option.level, '　');

          return (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {option.title ? (
                // タイトル部
                <div className="layer-combobox-group-title">
                  {`${indent}${option.title}`}
                </div>
              ) : (
                // 選択肢
                <li
                  {...renderProps}
                  className="MuiAutocomplete-option layer-combobox-item"
                >
                  {option.label && <div>{`${indent}${option.label}`}</div>}
                </li>
              )}
            </>
          );
        }}
        getOptionLabel={(option) => {
          if (typeof option === 'string') {
            return option;
          }
          return option.label ?? '';
        }}
        isOptionEqualToValue={(option, inputValue) =>
          // 選択中の選択肢ハイライト
          option.label
            ? option.label === (inputValue as unknown as string)
            : option.value === inputValue
        }
        filterOptions={(options, state) => {
          // 前方一致で検索。同一グループのタイトルは表示させる
          const groupIds = options
            // .filter((op) => (op.label ?? '').startsWith(state.inputValue)) // 前方一致
            .filter((op) => (op.label ?? '').includes(state.inputValue)) // 部分一致
            .map((op) => op.groupId);

          return options.filter(
            (op) =>
              // (op.label ?? '').startsWith(state.inputValue) ||
              (op.label ?? '').includes(state.inputValue) ||
              (groupIds.includes(op.groupId) && op.title)
          );
        }}
        noOptionsText="検索結果がありません"
      />
    );
  };

  /* eslint-disable 
    react/function-component-definition,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions,react/destructuring-assignment,
    @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/restrict-plus-operands,@typescript-eslint/no-explicit-any */
  // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/ArrayField.js
  // Latest commit 1bbd0ad
  // TODO propsは仮でany
  // 配列Widget用カスタムアイテム
  export function DefaultArrayItem(props: any) {
    const btnStyle = {
      flex: 1,
      paddingLeft: 6,
      paddingRight: 6,
      fontWeight: 'bold',
    };
    return (
      <div
        key={props.key}
        className={`array-item-border row ${props.className}`}
      >
        {/* <div className={props.hasToolbar ? "col-xs-9" : "col-xs-12"}></div> */}
        <div
          className={
            props.hasToolbar
              ? 'col-lg-11 col-md-11 col-sm-10 col-xs-9'
              : 'col-xs-12'
          }
        >
          {props.children}
        </div>

        {props.hasToolbar && (
          //   <div className="col-xs-3 array-item-toolbox">
          <div className="col-lg-1 col-md-1 col-sm-2 col-xs-3 array-item-toolbox">
            <div
              className="btn-group"
              style={{
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              {(props.hasMoveUp || props.hasMoveDown) && (
                <IconButton
                  icon="arrow-up"
                  aria-label="Move up"
                  className="array-item-move-up"
                  tabIndex="-1"
                  style={btnStyle}
                  disabled={
                    props.disabled || props.readonly || !props.hasMoveUp
                  }
                  onClick={props.onReorderClick(props.index, props.index - 1)}
                />
              )}

              {(props.hasMoveUp || props.hasMoveDown) && (
                <IconButton
                  icon="arrow-down"
                  className="array-item-move-down"
                  aria-label="Move down"
                  tabIndex="-1"
                  style={btnStyle}
                  disabled={
                    props.disabled || props.readonly || !props.hasMoveDown
                  }
                  onClick={props.onReorderClick(props.index, props.index + 1)}
                />
              )}

              {props.hasRemove && (
                <IconButton
                  type="danger"
                  icon="remove"
                  aria-label="Remove"
                  className="array-item-remove"
                  tabIndex="-1"
                  style={btnStyle}
                  disabled={props.disabled || props.readonly}
                  onClick={props.onDropIndexClick(props.index)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  /* eslint-enable */

  /* eslint-disable */
  // 配列object用追加ボタン
  // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/AddButton.js
  // Latest commit d6f0964
  type addButtonProp = {
    className: string;
    onClick: (event?: any) => void;
    disabled: boolean;
  };
  export function AddButton({ className, onClick, disabled }: addButtonProp) {
    return (
      // <div className="row">
      <div className="row array-item-padding">
        <p className={`col-xs-3 col-xs-offset-9 text-right ${className}`}>
          <IconButton
            type="info"
            icon="plus"
            className="btn-add col-xs-12"
            aria-label="Add"
            tabIndex="0"
            onClick={onClick}
            disabled={disabled}
          />
        </p>
      </div>
    );
  }

  interface RadioItem {
    label?: string; // 表示用項目名
    value?: string; // 実際の値
    title?: string; // 階層見出し
    items?: RadioItem[][]; // 子のラジオ項目
  }

  /**
   * oneOfで定義された階層表示可能なラジオボタン
   * @param props
   * @returns
   */
  export function LayerRadioButton(props: WidgetProps) {
    const {
      options,
      value,
      required,
      disabled,
      readonly,
      autofocus,
      onBlur,
      onFocus,
      onChange,
      id,
      schema,
    } = props;
    // Generating a unique field name to identify this set of radio buttons
    const name = Math.random().toString();
    // const { enumOptions, enumDisabled, inline } = options;

    // 選択肢を作成
    const createSelectItem = (
      radioItem: RadioItem,
      i: number
    ): JSX.Element | null => {
      const disabledCls = disabled || readonly ? 'disabled' : '';

      const radio = (checked: boolean, value: string, label: string) => {
        return (
          <span>
            <input
              type="radio"
              checked={checked}
              name={name}
              required={required}
              value={radioItem.value}
              disabled={disabled || readonly}
              autoFocus={autofocus && i === 0}
              onChange={(_) => onChange(value)}
              onBlur={onBlur && ((event) => onBlur(id, event.target.value))}
              onFocus={onFocus && ((event) => onFocus(id, event.target.value))}
            />
            <span>{label}</span>
          </span>
        );
      };

      return (
        <>
          {radioItem.items && (
            <>
              {radioItem.title && (
                <div className="control-label">
                  <label className="radio-label">{radioItem.title}</label>
                </div>
              )}
              {radioItem.items.map((radioItems) => {
                return (
                  <>
                    <div className={radioItem.title ? 'radio-item-div' : ''}>
                      {radioItems.map((oneItem) => {
                        return (
                          <>
                            {oneItem.items ? (
                              createSelectItem(oneItem, 1)
                            ) : (
                              <>
                                <label
                                  key={i}
                                  className={`radio-inline ${disabledCls} radio-label`}
                                >
                                  {radio(
                                    oneItem.value === value,
                                    oneItem.value ?? '',
                                    oneItem.label ?? ''
                                  )}
                                </label>
                              </>
                            )}
                          </>
                        );
                      })}
                    </div>
                  </>
                );
              })}
            </>
          )}
          {radioItem.label && radioItem.value && (
            <label
              key={i}
              className={`radio-inline ${disabledCls} radio-label`}
            >
              {radio(
                radioItem.value === value,
                radioItem.value,
                radioItem.label
              )}
            </label>
          )}
        </>
      );
    };

    // ラジオボタンのスキーマを解析して扱いやすい形式に変換する
    const createRadioItem = (radioItemList: RadioItem[], item: JSONSchema7) => {
      // const: 階層なし
      if (item.const) {
        radioItemList.push({
          label: item.title ? item.title : (item.const as string),
          value: item.const as string,
        });
      } else if (item.enum) {
        //enum: 1行に展開される選択肢一覧

        // enumの値から選択肢生成
        const enumItemList: RadioItem[] = [];
        item.enum.forEach((enumItem) => {
          if (typeof enumItem === 'string') {
            const enumVal = enumItem as string;
            enumItemList.push({ label: enumVal, value: enumVal });
          }
        });

        let isAdded = false;
        if (!item.title) {
          // タイトルなしのenumの場合は以前のセクションとして追加する
          const hasTitleItems = radioItemList.filter((p) => p.title && p.items);
          if (hasTitleItems.length > 0) {
            // 1つ前のタイトルありenumのitemsに追加する
            const prevRadioItem = hasTitleItems[hasTitleItems.length - 1];

            if (!prevRadioItem.items) {
              prevRadioItem.items = [];
            }
            prevRadioItem.items.push(enumItemList);
            isAdded = true;
          }
        }

        if (!isAdded) {
          // 新規セクションとして追加
          const newItem: RadioItem = { title: item.title ?? '' };
          newItem.items = [];
          newItem.items.push(enumItemList);
          radioItemList.push(newItem);
        }
      } else if (item.title && item.oneOf) {
        // oneOf(入れ子)
        const newItem: RadioItem = { title: item.title };
        newItem.items = [];

        const oneOfRadioItemList: RadioItem[] = [];
        (item.oneOf as JSONSchema7[]).forEach((tmpItem) => {
          createRadioItem(oneOfRadioItemList, tmpItem);
        });
        newItem.items.push(oneOfRadioItemList);

        const hasItems = radioItemList.filter((p) => p.items);
        if (hasItems.length > 0) {
          // 1つ前のitemsに追加する
          const prevRadioItem = hasItems[hasItems.length - 1];
          (prevRadioItem.items as RadioItem[][]).push([newItem]);
        } else {
          radioItemList.push(newItem);
        }
      }
    };

    const oneOf = schema.oneOf as JSONSchema7[];
    const radioItemList: RadioItem[] = [];
    // oneOfを解析してラジオ用のItem作成
    if (oneOf) {
      oneOf.forEach((item) => {
        createRadioItem(radioItemList, item);
      });
    }
    return (
      <div className="field-radio-group radio-item-div" id={id}>
        {radioItemList &&
          radioItemList.map((item: RadioItem, index: number) =>
            createSelectItem(item, index)
          )}
      </div>
    );
  }
}
/* eslint-enable */
