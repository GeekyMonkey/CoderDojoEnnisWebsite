<script setup lang="ts">
definePageMeta({ layout: false, siteSection: "lab" });
useHead({ title: "Lab 2024", meta: [{ name: "description", content: "" }] });
</script>
<template><div class="standalone-page">
<header>
<h1>https://coderdojoennis.com/lab</h1>
<NuxtLink to="/">
<pre>
   ____          _           ____        _       
  / ___|___   __| | ___ _ __|  _ \  ___ (_) ___  
 | |   / _ \ / _` |/ _ \ '__| | | |/ _ \| |/ _ \ 
 | |__| (_) | (_| |  __/ |  | |_| | (_) | | (_) |
  \____\___/ \__,_|\___|_|  |____/ \___// |\___/ 
    _          _       ____   ___ ____  |__/       
   | |    __ _| |__   |___ \ / _ \___ \| || |      
   | |   / _` | '_ \    __) | | | |__) | || |_     
   | |__| (_| | |_) |  / __/| |_| / __/|__   _|    
   |_____\__,_|_.__/  |_____|\___/_____|  |_|      
        </pre>
</NuxtLink>
</header>
<main>
<article>
<section>
<h2>Plan</h2>
<ul>
<li>50% Godot Learning</li>
<li>50% Project Work</li>
<li>Teams</li>
</ul>
</section>
<section>
<h2>Stuff Needed</h2>
<ul>
<li>
							Laptop with
							<a href="https://godotengine.org/download/">Godot 4.3</a>
</li>
<li>Mouse</li>
<li>Headphones</li>
<li>E-mail Account</li>
<li>
<a href="https://github.com">GitHub Account</a>
</li>
<li>
<a href="https://academy.zenva.com/product-category/all/game-development/godot/">Zenva Course Bundle</a>
<span> -- </span>
<a href="https://www.humblebundle.com/software/learn-godot-43-complete-course-bundle-software?partner=gamefromscratch
"><em>Sale ends 03 Oct 2024</em></a>
</li>
</ul>
</section>
</article>
<article>
<section>
<table class="full-width">
<tbody><tr>
<th>Ninja</th>
<th>Project</th>
</tr><tr>
<td>Alan</td>
<td>
<a>Shooter game for starters </a>
</td>
</tr><tr>
<td>
<a href="https://github.com/PeckyChicken/">Benjy</a>
</td>
<td>
<a href="https://github.com/PeckyChicken/Pushback">
<em>Pushback</em>
									: A checkers-style strategy board game
								</a>
</td>
</tr><tr>
<td>
<a href="https://github.com/Yurtle11/">Conor</a>
</td>
<td>
<a href=""> TBD </a>
</td>
</tr><tr>
<td>
<a href="https://github.com/Davkey">David (Davkey)</a>
</td>
<td>
<a>
<em>PANDELANCER</em>: A Quake/Half-life/Doom inspired first
									person shooter
								</a>
</td>
</tr><tr>
<td>Donnacha</td>
<td>
<a>Zelda-ish 16th century puzzle game </a>
</td>
</tr><tr>
<td>
<a href="https://github.com/declan43">declan</a>
</td>
<td>
<a>racing game</a>
</td>
</tr><tr>
<td>
<a href="https://github.com/Mj517">Eoin</a>
</td>
<td>
<a><em>Wisp</em>: dungeon crawler</a>
</td>
</tr><tr>
<td>
<a href="https://github.com/Bigspud200">Oisín</a>
</td>
<td>
<a>Top down car endless runner</a>
</td>
</tr><tr>
<td>
<a href="https://github.com/rozzy1/">Ross</a>
</td>
<td>
<a href="https://github.com/Rozzy1/Blobby">
<em>Blobbly</em>: 2D platformer puzzle game
								</a>
</td>
</tr><tr>
<td>
<a href="https://github.com/GeekyMonkey">Russ</a>
</td>
<td>
<a href="https://github.com/CoderDojo-Ennis/GodotSteampunkShooter#readme">
<img alt="Steampunk Doom Icon" src="https://raw.githubusercontent.com/CoderDojo-Ennis/GodotSteampunkShooter/main/icon.png"/>
									Steampunk Doom
								</a>
</td>
</tr><tr>
<td>Shane</td>
<td>
<a>A 2D game foundation?</a>
</td>
</tr><tr>
<td>
<a href="https://github.com/tiernancoderodjo">Tiernan</a>
</td>
<td>
<a href="https://github.com/tiernancoderodjo">
									Work on the Coderdojo website html
								</a>
</td>
</tr></tbody>












</table>
</section>
</article>
</main>
<footer>
<span>
<a href="https://github.com/GeekyMonkey/CoderDojoEnnisWebsite">
					Edit this document on GitHub
				</a>
</span>
<span id="Cursor"> </span>
</footer>
<div id="Overlay"></div>
</div></template>

<style lang="scss">
/* Original declarations; selectors confined to this standalone document. */
html[data-site-section="lab"] { all: revert; color-scheme: light; }
:where(html[data-site-section="lab"]) body,
:where(html[data-site-section="lab"] .standalone-page *) { all: revert; }

			html[data-site-section="lab"] {
				background-color: #142014;
			}
			:where(html[data-site-section="lab"]) .standalone-page a {
				color: #77ff77 !important;
			}
			:where(html[data-site-section="lab"]) .standalone-page a:hover {
				color: #142014 !important;
			}
			:where(html[data-site-section="lab"]) .standalone-page a:not([href]):hover {
				color: #77ff77 !important;
				background-color: #142014;
			}
			:where(html[data-site-section="lab"]) .standalone-page article {
				display: flex;
				flex-wrap: wrap;
				gap: 20px;
				margin-bottom: 20px;
				justify-content: center;
			}
			:where(html[data-site-section="lab"]) .standalone-page article section {
				min-width: 300px;
			}
			:where(html[data-site-section="lab"]) .standalone-page table {
				width: 100%;
				max-width: 800px;
				border-collapse: collapse;
			}
			:where(html[data-site-section="lab"]) .standalone-page .full-width {
				width: 100%;
			}

			:where(html[data-site-section="lab"]) .standalone-page th {
				text-align: left;
				font-weight: bold;
				font-style: italic;
				font-size: 1.5rem;
				color: #142014;
				background-color: #77ff77;
			}
			:where(html[data-site-section="lab"]) .standalone-page td {
				padding: 4px 10px;
				border: solid 1px #44dd44;
			}
			:where(html[data-site-section="lab"]) .standalone-page td a {
				width: 100%;
				display: block;
			}
			:where(html[data-site-section="lab"]) .standalone-page td img {
				margin-right: 10px;
				vertical-align: middle;
				width: 40px;
			}
			:where(html[data-site-section="lab"]) .standalone-page em {
				font-style: italic;
				font-weight: bold;
				text-transform: uppercase;
			}
		
html[data-site-section="lab"] {
	height: 100%;
}
:where(html[data-site-section="lab"]) .standalone-page * {
	box-sizing: border-box;
}
:where(html[data-site-section="lab"]) .standalone-page a {
	color: #44ffff;
	-moz-user-select: none;
	-ms-user-select: none;
	-webkit-user-select: none;
	user-select: none;
}
:where(html[data-site-section="lab"]) .standalone-page a:focus {
	outline: none;
	color: #142014 !important;
	background-color: #77ff77;
}
:where(html[data-site-section="lab"]) .standalone-page a:visited {
	color: inherit;
}
:where(html[data-site-section="lab"]) .standalone-page a:hover {
	background-color: #77ff77;
	color: #142014;
	text-decoration: none;
}
:where(html[data-site-section="lab"]) body {
	color: #77ff77;
	background-color: #142014;
	position: relative;
	margin: 0;
	padding: 20px;
	min-height: 100%;
	font-family: "Courier New", Courier, monospace;
	padding-bottom: 40px;
}
:where(html[data-site-section="lab"]) body:after {
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
}
:where(html[data-site-section="lab"]) .standalone-page header {
	text-align: center;
}
:where(html[data-site-section="lab"]) .standalone-page header pre {
	margin-top: 0;
	display: inline-block;
}
:where(html[data-site-section="lab"]) .standalone-page header a {
	color: #77ff77;
	text-decoration: none;
}
:where(html[data-site-section="lab"]) .standalone-page header a:hover,
:where(html[data-site-section="lab"]) .standalone-page header a:focus {
	background-color: #142014 !important;
	color: #4444ff !important;
}
:where(html[data-site-section="lab"]) .standalone-page article h1 {
	text-align: center;
	display: table;
	width: 100%;
}
:where(html[data-site-section="lab"]) .standalone-page article h1 span {
	display: table-cell;
	color: #4444ff;
}
:where(html[data-site-section="lab"]) .standalone-page article h1:before {
	content: "**** ";
	display: table-cell;
	text-align: right;
}
:where(html[data-site-section="lab"]) .standalone-page article h1:after {
	content: " ****";
	display: table-cell;
	text-align: left;
}
:where(html[data-site-section="lab"]) .standalone-page article nav {
	font-size: 20px;
}
:where(html[data-site-section="lab"]) .standalone-page article nav a {
	color: #77ff77;
}
:where(html[data-site-section="lab"]) .standalone-page ul {
	list-style-type: none;
	padding-left: 20px;
}
:where(html[data-site-section="lab"]) .standalone-page ul li {
	position: relative;
	padding-top: 10px;
}
:where(html[data-site-section="lab"]) .standalone-page ul li:before {
	position: absolute;
	left: -20px;
	top: 10px;
	content: "* ";
}
:where(html[data-site-section="lab"]) .standalone-page ul li a {
	display: inline-block;
	/*margin-top: -10px;*/
	/*padding: 10px;*/
	text-transform: uppercase;
}
:where(html[data-site-section="lab"]) .standalone-page footer {
	position: absolute;
	bottom: 0;
}
:where(html[data-site-section="lab"]) .standalone-page #Cursor {
	animation: lab-blink 1s step-start 0s infinite;
	-webkit-animation: lab-blink 1s step-start 0s infinite;
	white-space: pre;
	background-color: #77ff77;
	color: #142014;
}
:where(html[data-site-section="lab"]) .standalone-page #Overlay {
	pointer-events: none;
	background-repeat: repeat;
	background-image: url("/theme/retro/css/CTRLines.png");
	background-size: auto 16px;
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	opacity: 0.5;
}
@keyframes lab-blink {
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
:where(html[data-site-section="lab"]) .standalone-page .lab-blink {
	animation: lab-blink 1s step-start 0s infinite;
	-webkit-animation: lab-blink 1s step-start 0s infinite;
}
:where(html[data-site-section="lab"]) .standalone-page form {
	text-align: center;
}
:where(html[data-site-section="lab"]) .standalone-page form .FormField {
	margin-bottom: 20px;
}
:where(html[data-site-section="lab"]) .standalone-page form label {
	display: block;
	margin-bottom: 4px;
}
:where(html[data-site-section="lab"]) .standalone-page form input,
:where(html[data-site-section="lab"]) .standalone-page form select {
	background-color: transparent;
	border: solid 1px green;
	font-size: 18px;
	color: lime;
	text-align: center;
	outline: solid 1px transparent;
}
:where(html[data-site-section="lab"]) .standalone-page form input:focus,
:where(html[data-site-section="lab"]) .standalone-page form select:focus {
	outline-color: yellow;
}
:where(html[data-site-section="lab"]) .standalone-page form button {
	background-color: transparent;
	border: solid 2px lime;
	color: lime;
	text-transform: uppercase;
	outline: solid 1px blue;
	padding: 5px 10px;
	margin-bottom: 4px;
}
:where(html[data-site-section="lab"]) .standalone-page form button:hover,
:where(html[data-site-section="lab"]) .standalone-page form button:focus {
	color: white;
	outline-color: yellow;
}
:where(html[data-site-section="lab"]) .standalone-page form button:disabled {
	color: grey;
	outline-color: black;
	border-color: grey;
}
:where(html[data-site-section="lab"]) .standalone-page form .ValidationError {
	color: red;
	display: none;
}
:where(html[data-site-section="lab"]) .standalone-page form .Invalid .ValidationError {
	display: block;
}
:where(html[data-site-section="lab"]) .standalone-page form .Invalid input,
:where(html[data-site-section="lab"]) .standalone-page form .Invalid select {
	border-color: red;
}
:where(html[data-site-section="lab"]) .standalone-page .HideUntilReady {
	opacity: 0;
}
:where(html[data-site-section="lab"]) .standalone-page .HideUntilReady.Ready {
	opacity: 1;
	transition: 1s;
}

</style>
