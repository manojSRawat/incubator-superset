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
import { t } from '@superset-ui/core';
import { InfoTooltipWithTrigger } from '@superset-ui/chart-controls';

import Popover from 'src/components/Popover';
import FormRow from '../../../components/FormRow';
import SelectControl from './SelectControl';
import CheckboxControl from './CheckboxControl';
import ColorPickerControl from './ColorPickerControl';
import TextControl from './TextControl';
import { FILTER_CONFIG_ATTRIBUTES } from '../../constants';
// import { Col, Collapse, Row, Well } from 'react-bootstrap';

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
  dateFormat: PropTypes.string,
  conditionalColumn: PropTypes.string,
  conditionalColumnTextColor: PropTypes.object,
  totalFormula: PropTypes.string,
  disableFilters: PropTypes.bool,
  defaultValue: PropTypes.string,
  conditions: PropTypes.array,
  thumbnailHeight: PropTypes.number,
  thumbnailWidth: PropTypes.number,
  remarkColumn: PropTypes.string,
};

const defaultProps = {
  onChange: () => {},
  asc: true,
  clearable: true,
  multiple: true,
  searchAllOptions: false,
  conditions: [],
  showTotal: false,
  dateFormat: null,
  conditionalColumn: null,
  conditionalColumnTextColor: { r: 0, g: 0, b: 0, a: 255 },
  disableFilters: true,
  thumbnailHeight: 50,
  thumbnailWidth: 50,
};

const STYLE_WIDTH = { width: 350 };

export default class ConditionalTableFilterBox extends React.Component {
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
      dateFormat,
      conditionalColumn,
      conditionalColumnTextColor,
      totalFormula,
      conditions,
      thumbnailHeight,
      thumbnailWidth,
      remarkColumn,
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
      thumbnailHeight,
      thumbnailWidth,
      remarkColumn,
      showTotal,
      dateFormat,
      conditionalColumn,
      conditionalColumnTextColor,
      totalFormula,
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
      ['DATE', 'Date'],
      ['LINK', 'Link'],
    ];
    this.onChange = this.onChange.bind(this);
    this.onControlChange = this.onControlChange.bind(this);
  }

  onChange() {
    this.props.onChange(this.state);
  }

  onControlChange(attr, value) {
    let typedValue = value;
    const { column: selectedColumnName, multiple } = this.state;
    if (value && !multiple && attr === FILTER_CONFIG_ATTRIBUTES.DEFAULT_VALUE) {
      // if single value filter_box,
      // convert input value string to the column's data type
      const { datasource } = this.props;
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
    this.setState({ [attr]: typedValue }, this.onChange);
  }

  setType() {}

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
        <FormRow
          label={t('Alignment')}
          control={
            <SelectControl
              value={this.state.alignment}
              placeholder="Alignment"
              name="alignment"
              choices={this.alignments}
              onChange={v => this.onControlChange('alignment', v)}
            />
          }
        />
        <FormRow
          label={t('Format')}
          control={
            <SelectControl
              value={this.state.format}
              placeholder="Number Format"
              name="format"
              choices={this.formats}
              onChange={v => this.onControlChange('format', v)}
            />
          }
        />
        <FormRow
          label={t('Thumbnail Height')}
          control={
            <TextControl
              value={this.state.thumbnailHeight}
              name="thumbnailHeight"
              onChange={v => this.onControlChange('thumbnailHeight', v)}
            />
          }
        />
        <FormRow
          label={t('Thumbnail Width')}
          control={
            <TextControl
              value={this.state.thumbnailWidth}
              name="thumbnailWidth"
              onChange={v => this.onControlChange('thumbnailWidth', v)}
            />
          }
        />
        <FormRow
          label={t('Remark Column')}
          control={
            <TextControl
              value={this.state.remarkColumn}
              name="remarkColumn"
              onChange={v => this.onControlChange('remarkColumn', v)}
            />
          }
        />
        <FormRow
          label={t('Show Total')}
          tooltip={t('Total')}
          isCheckbox
          control={
            <CheckboxControl
              value={this.state.showTotal}
              onChange={v => this.onControlChange('showTotal', v)}
            />
          }
        />
        <FormRow
          label={t('Total Formula')}
          control={
            <TextControl
              name="totalFormula"
              placeholder="Total Formula"
              value={this.state.totalFormula}
              onChange={v => this.onControlChange('totalFormula', v)}
            />
          }
        />
        <FormRow
          label={t('Disable Filter')}
          tooltip={t('Disable search option')}
          isCheckbox
          control={
            <CheckboxControl
              value={this.state.disableFilters}
              onChange={v => this.onControlChange('disableFilters', v)}
            />
          }
        />

        <FormRow
          label={t('Disable Sorting')}
          tooltip={t('Disable sorting')}
          isCheckbox
          control={
            <CheckboxControl
              value={this.state.disableSortBy}
              onChange={v => this.onControlChange('disableSortBy', v)}
            />
          }
        />
        <FormRow
          label={t('Date Format')}
          tooltip={t("If it's a date filter")}
          control={
            <TextControl
              name="dateFormat"
              placeholder="Date Format"
              value={this.state.dateFormat}
              onChange={v => this.onControlChange('dateFormat', v)}
            />
          }
        />
        <FormRow
          label={t('Conditional Column')}
          tooltip={t('Color will be applied from this column')}
          control={
            <TextControl
              name="conditionalColumn"
              placeholder="Conditional Column"
              value={this.state.conditionalColumn}
              onChange={v => this.onControlChange('conditionalColumn', v)}
            />
          }
        />
        <FormRow
          label={t('Conditional Column Text Color')}
          tooltip={t('Color will be applied from this column')}
          control={
            <ColorPickerControl
              name="conditionalColumnTextColor"
              value={this.state.conditionalColumnTextColor}
              onChange={v => this.onControlChange('conditionalColumnTextColor', v)}
            />
          }
        />
        <div className="row" style={{ margin: '15px 5px 0 0' }}>
          <div className="ant-popover-title">
            <span style={{ marginRight: '5px' }}>Conditions</span>
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
      color: { r: 0, g: 0, b: 0, a: 255 },
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
        { conditions: JSON.parse(JSON.stringify(conditions)) },
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
    const { conditions } = this.state;
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
        label={t('Initial Value')}
        control={
          <TextControl
            value={value.initialValue}
            name="initialValue"
            onChange={v => onChange('initialValue', v, index)}
          />
        }
      />
      <FormRow
        label={t('Initial Symbol')}
        control={
          <SelectControl
            choices={symbols}
            name="initialSymbol"
            value={value.initialSymbol}
            onChange={v => onChange('initialSymbol', v, index)}
          />
        }
      />
      <FormRow
        label={t('Final Value')}
        control={
          <TextControl
            value={value.finalValue}
            name="finalValue"
            onChange={v => onChange('finalValue', v, index)}
          />
        }
      />
      <FormRow
        label={t('Final Symbol')}
        control={
          <SelectControl
            choices={symbols}
            name="finalSymbol"
            value={value.finalSymbol}
            onChange={v => onChange('finalSymbol', v, index)}
          />
        }
      />
      <FormRow
        label={t('color')}
        control={
          <ColorPickerControl
            name="color"
            value={value.color}
            onChange={v => onChange('color', v, index)}
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

ConditionalTableFilterBox.propTypes = propTypes;
ConditionalTableFilterBox.defaultProps = defaultProps;
