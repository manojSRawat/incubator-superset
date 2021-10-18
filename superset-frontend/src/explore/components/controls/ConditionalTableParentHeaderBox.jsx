/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {t} from '@superset-ui/core';
import {InfoTooltipWithTrigger} from '@superset-ui/chart-controls';

import Popover from 'src/components/Popover';
import FormRow from '../../../components/FormRow';
import SelectControl from './SelectControl';
import CheckboxControl from './CheckboxControl';
import ColorPickerControl from './ColorPickerControl';
import TextControl from './TextControl';
import {FILTER_CONFIG_ATTRIBUTES} from '../../constants';

const INTEGRAL_TYPES = new Set([
  'TINYINT',
  'SMALLINT',
  'INT',
  'INTEGER',
  'BIGINT',
  'LONG',
]);
const DECIMAL_TYPES = new Set([
  'FLOAT',
  'DOUBLE',
  'REAL',
  'NUMERIC',
  'DECIMAL',
  'MONEY',
]);

const propTypes = {
  datasource: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  asc: PropTypes.bool,
  clearable: PropTypes.bool,
  multiple: PropTypes.bool,
  column: PropTypes.string,
  label: PropTypes.string,
  metric: PropTypes.string,
  searchAllOptions: PropTypes.bool,
  showTotal: PropTypes.bool,
  disableFilters: PropTypes.bool,
  defaultValue: PropTypes.string,
  conditions: PropTypes.array,
};

const defaultProps = {
  onChange: () => {
  },
  asc: true,
  clearable: true,
  multiple: true,
  searchAllOptions: false,
  conditions: [],
  showTotal: false,
  disableFilters: true,
  // eslint-disable-next-line react/default-props-match-prop-types
  disableSortBy: false,
};

const STYLE_WIDTH = {width: 350};

export default class ConditionalTableParentHeaderBox extends React.Component {
  constructor(props) {
    super(props);
    const {
      column,
      metric,
      asc,
      clearable,
      multiple,
      searchAllOptions,
      label,
      defaultValue,
      alignment,
      format,
      showTotal,
      conditions,
      disableFilters,
      disableSortBy,
    } = props;
    this.state = {
      column,
      metric,
      label,
      asc,
      clearable,
      multiple,
      searchAllOptions,
      defaultValue,
      alignment,
      format,
      showTotal,
      conditions,
      disableFilters,
      disableSortBy,
    };
    this.symbols = [
      ['=', 'EQUAL'],
      ['>', 'GREATER'],
      ['>=', 'GREATER_EQUAL'],
      ['<', 'LESS'],
      ['<=', 'LESS_EQUAL'],
    ];
    this.alignments = [
      ['left', 'Left'],
      ['right', 'Right'],
      ['center', 'Center'],
    ];
    this.formats = [
      ['IN', 'Indian number'],
      ['PERCENTAGE', 'Percentage'],
      ['IMAGE', 'Image'],
    ];
    this.onChange = this.onChange.bind(this);
    this.onControlChange = this.onControlChange.bind(this);
  }

  onChange() {
    this.props.onChange(this.state);
  }

  onControlChange(attr, value) {
    let typedValue = value;
    const {column: selectedColumnName, multiple} = this.state;
    if (value && !multiple && attr === FILTER_CONFIG_ATTRIBUTES.DEFAULT_VALUE) {
      // if single value filter_box,
      // convert input value string to the column's data type
      const {datasource} = this.props;
      const selectedColumn = datasource.columns.find(
        col => col.column_name === selectedColumnName,
      );

      if (selectedColumn && selectedColumn.type) {
        const type = selectedColumn.type.toUpperCase();
        if (type === 'BOOLEAN') {
          typedValue = value === 'true';
        } else if (INTEGRAL_TYPES.has(type)) {
          typedValue = Number.isNaN(Number(value)) ? null : parseInt(value, 10);
        } else if (DECIMAL_TYPES.has(type)) {
          typedValue = Number.isNaN(Number(value)) ? null : parseFloat(value);
        }
      }
    }
    this.setState({[attr]: typedValue}, this.onChange);
  }

  setType() {
  }

  textSummary() {
    return this.state.column || 'N/A';
  }

  renderForm() {
    return (
      <div>
        <FormRow
          label={t('Column Key')}
          control={
            <TextControl
              value={this.state.column}
              name="column"
              onChange={v => this.onControlChange('column', v)}
            />
          }
        />
        <div className="row" style={{margin: '15px 5px 0 0'}}>
          <div className="ant-popover-title">
            <span style={{marginRight: '5px'}}>Children</span>
            <i
              onClick={this.addNewForm}
              className="fa fa-plus fa-lg text-primary"
            />
          </div>
        </div>

        {this.renderFormArray()}
      </div>
    );
  }

  addNewForm = () => {
    const { conditions } = this.state;
    conditions.push({
      initialValue: null,
      initialSymbol: null,
      finalValue: null,
      finalSymbol: null,
      color: {r: 0, g: 0, b: 0, a: 255},
    });
    this.setState({ conditions: JSON.parse(JSON.stringify(conditions)) });
  };

  renderFormArray = () => {
    const { conditions } = this.state;
    const result = [];
    const onChange = (key, value, index) => {
      conditions[index][key] = value;
      // this.setState({conditions: JSON.parse(JSON.stringify(conditions))});
      this.setState(
        { children: JSON.parse(JSON.stringify(conditions)) },
        this.onChange,
      );
    };

    conditions.forEach((value, index) => {
      result.push(
        <ArrayFunction
          onChange={onChange}
          symbols={this.symbols}
          value={value}
          index={index}
          key={index}
        />,
      );
    });

    return result;
  };

  renderPopover() {
    return (
      <div id="ts-col-popo" style={STYLE_WIDTH}>
        {this.renderForm()}
      </div>
    );
  }

  render() {
    const {conditions} = this.state;
    return (
      <span>
        {this.textSummary()}{' '}
        <Popover
          trigger="click"
          placement="right"
          content={this.renderPopover()}
          title={t('Filter Configuration')}
        >
          <InfoTooltipWithTrigger
            icon="edit"
            className="text-primary"
            label="edit-ts-column"
          />

        </Popover>
      </span>
    );
  }
}

const ArrayFunction = ({ value, index, onChange, symbols }) => {
  return (
    <>
      <FormRow
        label={t('Child key')}
        control={
          <TextControl
            value={value.childKey}
            name="childKey"
            onChange={v => onChange('childKey', v, index)}
          />
        }
      />
      <hr
        style={{
          color: '#000',
          height: 5,
        }}
      />
    </>
  );
};

ConditionalTableParentHeaderBox.propTypes = propTypes;
ConditionalTableParentHeaderBox.defaultProps = defaultProps;
