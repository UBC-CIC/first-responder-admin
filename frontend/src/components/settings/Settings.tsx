import React, { useState } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';

const Settings = () => {
  const [ volume, setVolume ] = useState(5); 
  
  return (
    <Form noValidate>
      <Form.Row>
        <Form.Group as={Col} md="2" >
          <Form.Label>Sound Control</Form.Label>
          <Form.Check
            type="switch"
            id="custom-switch"
          />
        </Form.Group>
        <Form.Group as={Col} md="4" show>
          <Form.Label>Volume</Form.Label>
          <RangeSlider
            value={volume}
            variant='success'
            min={0}
            max={100}
            tooltip='on'
            onChange={e => setVolume(parseInt(e.target.value))}
          />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="12" >
          <Button type="submit">Save</Button>
        </Form.Group>
      </Form.Row>
    </Form>
  )
};

export default Settings;

