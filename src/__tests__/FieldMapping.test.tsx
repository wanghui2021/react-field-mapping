import React from 'react';
import { render } from '@testing-library/react';
import FieldMapping from '../fieldMapping';

describe('FieldMapping', () => {
  test('renders container', () => {
    render(
      <FieldMapping
        className=""
        style={{}}
        isSort={false}
        relation={[]}
        source={{ data: [], onChange: () => {}, mutiple: false, columns: [] }}
        target={{ data: [], onChange: () => {}, mutiple: false, columns: [] }}
        onDrawStart={() => {}}
        onDrawing={() => {}}
        onDrawEnd={() => {}}
        edit={true}
      />
    );
    expect(document.querySelector('.react-field-mapping-box')).toBeInTheDocument();
  });
});
