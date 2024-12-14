<script lang="ts"></script>

<template>
	<div id="BodyOverlay1"></div>
	<div id="BodyOverlay2"></div>
</template>

<style lang="scss">
	@layer theme {
		[theme="crt"] {
			--BrightGreen: #77ff77;
			body {
				/* ShadCn */
				--background-color: #142014;
				--foreground-color: var(--BrightGreen);
				--hilight-color: var(--BrightGreen);
				--shadow-color: transparent;
				--sidebar-background: 240 5.9% 10%;
				--sidebar-foreground: 240 4.8% 95.9%;
				--sidebar-primary: 224.3 76.3% 48%;
				--sidebar-primary-foreground: 0 0% 100%;
				--sidebar-accent: 240 3.7% 15.9%;
				--sidebar-accent-foreground: 240 4.8% 95.9%;
				--sidebar-border: 240 3.7% 15.9%;
				--sidebar-ring: 217.2 91.2% 59.8%;

				--card-border-color: var(--BrightGreen);
				--border-radius: 0px;

				/* TailwindCSS */
				--background: 222.2 84% 4.9%;
				--foreground: 210 40% 98%;

				--muted: 217.2 32.6% 17.5%;
				--muted-foreground: 215 20.2% 65.1%;

				--popover: 222.2 84% 4.9%;
				--popover-foreground: 210 40% 98%;

				--card: 222.2 84% 4.9%;
				--card-foreground: 210 40% 98%;

				--border: 217.2 32.6% 17.5%;
				--input: 217.2 32.6% 17.5%;

				--primary: 217.2 82.6% 17.5%;
				--primary-foreground: 222.2 47.4% 91.2%;

				--secondary: 28.2deg 82.6% 17.5%;
				--secondary-foreground: 210 40% 98%;

				--accent: 217.2 82.6% 17.5%;
				--accent-foreground: 210 40% 98%;

				--destructive: 0 62.8% 30.6%;
				--destructive-foreground: 210 40% 98%;

				--ring: 212.7 26.8% 83.9%;

				background-color: var(--background-color) !important;
				font-family: "Courier New", Courier, monospace;
				position: relative;
			}

			#BodyOverlay1 {
				pointer-events: none;
				background-repeat: repeat;
				background-image: url("/theme/retro/css/CTRLines2.png");
				image-rendering: pixelated;
				background-size: auto 16px;
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				opacity: 0.3;
			}

			#BodyOverlay2 {
				content: "";
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				pointer-events: none;
				background-repeat: no-repeat;
				background-size: 100% 100%;
				background-image: url("/theme/retro/css/CRTVignette.png");
				opacity: 1;
			}

			.Alert {
				border-radius: 0 !important;
				font-weight: 700 !important;
				font-size: 1.1rem !important;
				border: dashed 1px var(--background-color) !important;

				&.text-destructive {
					background-color: red !important;
					color: black !important;
				}
			}

			.Button {
				border-radius: 0 !important;
				border: none !important;
				outline: 2px solid var(--background-color) !important;
				outline-offset: -3px !important;
				background-color: var(--BrightGreen) !important;
				color: black !important;
				font-weight: 700 !important;
				font-size: 1.1rem !important;
			}

			.CardHeader {
				background-color: var(--BrightGreen) !important;
				color: var(--background-color) !important;
				font-style: italic !important;
				font-weight: 700 !important;
				font-size: 1.25rem !important;
			}

			.Input {
				border-radius: 0 !important;
				border-color: var(--BrightGreen) !important;
				background-color: #00000055 !important;
			}
		}
	}
	/*
		html {
	  height: 100%;
	}
	* {
	  box-sizing: border-box;
	}
	a {
	  color: #44ffff;
	  -moz-user-select: none;
	  -ms-user-select: none;
	  -webkit-user-select: none;
	  user-select: none;
	}
	a:focus {
	  outline: none;
	  color: #142014 !important;
	  background-color: #77ff77;
	}
	a:visited {
	  color: inherit;
	}
	a:hover {
	  background-color: #77ff77;
	  color: #142014;
	  text-decoration: none;
	}
	body {
	  color: #77ff77;
	  background-color: #142014;
	  position: relative;
	  margin: 0;
	  padding: 20px;
	  min-height: 100%;
	  padding-bottom: 40px;
	}
	body:after {
	  content: "";
	  position: absolute;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  pointer-events: none;
	  background-repeat: no-repeat;
	  background-size: 100% 100%;
	  background-image: url("CRTVignette.png");
	}
	header {
	  text-align: center;
	}
	header pre {
	  margin-top: 0;
	  display: inline-block;
	}
	header a {
	  color: #77ff77;
	  text-decoration: none;
	}
	header a:hover,
	header a:focus {
	  background-color: #142014 !important;
	  color: #4444ff !important;
	}
	article h1 {
	  text-align: center;
	  display: table;
	  width: 100%;
	}
	article h1 span {
	  display: table-cell;
	  color: #4444ff;
	}
	article h1:before {
	  content: "**** ";
	  display: table-cell;
	  text-align: right;
	}
	article h1:after {
	  content: " ****";
	  display: table-cell;
	  text-align: left;
	}
	article nav {
	  font-size: 20px;
	}
	article nav a {
	  color: #77ff77;
	}
	ul {
	  list-style-type: none;
	  padding-left: 20px;
	}
	ul li {
	  position: relative;
	  padding-top: 10px;
	}
	ul li:before {
	  position: absolute;
	  left: -20px;
	  top: 10px;
	  content: "* ";
	}
	ul li a {
	  display: inline-block;
	  text-transform: uppercase;
	}
	footer {
	  position: absolute;
	  bottom: 0;
	}
	#Cursor {
	  animation: blink 1s step-start 0s infinite;
	  -webkit-animation: blink 1s step-start 0s infinite;
	  white-space: pre;
	  background-color: #77ff77;
	  color: #142014;
	}
	#Overlay {
	  pointer-events: none;
	  background-repeat: repeat;
	  background-image: url("CTRLines.png");
	  background-size: auto 16px;
	  position: absolute;
	  left: 0;
	  right: 0;
	  top: 0;
	  bottom: 0;
	  opacity: 0.5;
	}
	@keyframes blink {
	  0% {
	    opacity: 1;
	  }
	  50% {
	    opacity: 0;
	  }
	  100% {
	    opacity: 1;
	  }
	}
	.blink {
	  animation: blink 1s step-start 0s infinite;
	  -webkit-animation: blink 1s step-start 0s infinite;
	}
	form {
	  text-align: center;
	}
	form .FormField {
	  margin-bottom: 20px;
	}
	form label {
	  display: block;
	  margin-bottom: 4px;
	}
	form input,
	form select {
	  background-color: transparent;
	  border: solid 1px green;
	  font-size: 18px;
	  color: lime;
	  text-align: center;
	  outline: solid 1px transparent;
	}
	form input:focus,
	form select:focus {
	  outline-color: yellow;
	}
	form button {
	  background-color: transparent;
	  border: solid 2px lime;
	  color: lime;
	  text-transform: uppercase;
	  outline: solid 1px blue;
	  padding: 5px 10px;
	  margin-bottom: 4px;
	}
	form button:hover,
	form button:focus {
	  color: white;
	  outline-color: yellow;
	}
	form button:disabled {
	  color: grey;
	  outline-color: black;
	  border-color: grey;
	}
	form .ValidationError {
	  color: red;
	  display: none;
	}
	form .Invalid .ValidationError {
	  display: block;
	}
	form .Invalid input,
	form .Invalid select {
	  border-color: red;
	}
	.HideUntilReady {
	  opacity: 0;
	}
	.HideUntilReady.Ready {
	  opacity: 1;
	  transition: 1s;
	}

		*/
</style>
