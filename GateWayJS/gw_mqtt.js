// LIBS
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const parser = new Readline();
var mqtt = require('mqtt');

// SERIAL PORT SETTINGS
// var serial_port = '/dev/ttyACM0'; // RPI
// var serial_port = 'COM3'; // windows
var serial_port = '/dev/cu.usbmodem141101'; // Mac
const serialPort = new SerialPort(serial_port, {
    baudRate: 115200,autoOpen: false 
  })

serialPort.pipe(parser);

// MQTT SETTINGS Example
var mqtt_host     = 'mqtt://m10.cloudmqtt.com';
var mqtt_port     =  19839;
var mqtt_username =  'tag';
var mqtt_password =  'tag';

var KEY = 'myDevice';


// MQTT CLIENT OPTIONS
var mqtt_Options = {
     port:              mqtt_port
    ,keepalive:         10                  //seconds, set to 0 to disable
    ,clientId:          'haall_' + KEY
    ,protocolId:        'MQTT'
    //,protocolVersion: 4
    ,clean:             true               //set to false to receive QoS 1 and 2 messages while offline
    ,reconnectPeriod:   1000                // milliseconds, interval between two reconnections
    ,connectTimeout:    30 * 1000           //milliseconds, time to wait before a CONNACK is received
    ,username:          mqtt_username       //the username required by your broker, if any
    ,password:          mqtt_password       //the password required by your broker, if any
    /*
    ,incomingStore: , // a Store for the incoming packets
    ,outgoingStore: , // a Store for the outgoing packets
    */
   /*
    //a message that will sent by the broker automatically when the client disconnect badly. The format is:
    ,will: {topic:  '/tag/'+KEY+'/out',                           // the topic to publish
            payload:'Client haall_' + KEY +'has lost connection',   // the message to publish
            qos:    0,                                              // the QoS
            retain: false                                           // the retain flag 
    }
    */    
}


// START SERIAL PORT 
console.log('Opening Serial port...');
serialPort.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('Serial port opened!');
  }
});

// START MQTT
console.log('Starting MQTT...'); 
var mqtt_client  = mqtt.connect(mqtt_host,mqtt_Options);
console.log('Subscribing MQTT...'); 

mqtt_client.subscribe('/tag/'+KEY+'/in/#');
console.log('Publish MQTT...'); 

//mqtt_client.publish('/tag/'+KEY+'/out/msg', KEY+' mqtt client started at '+ new Date());

parser.on('data', function (data) {
  //console.log('Data:', data);
  mqttPublish(data);
})
  

// MQTT INCOMING
// message /tag/ledA/in/0 = ON
// message /tag/ledA/in/1 = OFF
mqtt_client.on('message', function (topic, message) {
  /*
	var m = topic.toString();
	m = m.replace('/tag/'+KEY+'/in/','');
	m = m.split('/').join(';');
  m = m + ';' + message.toString();
  */
	serialPort.write('' + message + '\n');

  	console.log('INCOMING MQTT: ' + topic + ':' + message.toString());
});

// MQTT OUTGOING
function mqttPublish(data){
	var topic = '/tag/'+KEY+'/out/';
	var payload = data;
	mqtt_client.publish(topic,payload);
	console.log('OUTGOING MQTT: ' + topic + ' Payload: ' + payload);
}

