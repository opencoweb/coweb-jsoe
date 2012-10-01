//
// Config file. Split out from the app for ease of overlaying a new config
// without affecting the app controller.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//
var dojoConfig = {
	baseUrl: '/',
	async:true,
	
	paths : {
	},
	
	packages: [{
		name: "coweb",
		location: "./coweb",
		main: "main"
	},
	{
		name: 'dojo',
		location:'https://ajax.googleapis.com/ajax/libs/dojo/1.8.0/dojo',
		main:'main'
	},
	{
		name: 'dijit',
		location:'https://ajax.googleapis.com/ajax/libs/dojo/1.8.0/dijit',
		main:'main'
	},
	{
		name: 'dojox',
		location:'https://ajax.googleapis.com/ajax/libs/dojo/1.8.0/dojox',
		main:'main'
	}]
};

