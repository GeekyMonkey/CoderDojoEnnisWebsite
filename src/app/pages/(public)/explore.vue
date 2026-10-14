<script setup lang="ts">
import PublicCallToAction from "~/components/Public/PublicCallToAction.vue";
import PublicCard from "~/components/Public/PublicCard.vue";
import PublicPageIntro from "~/components/Public/PublicPageIntro.vue";
definePageMeta({ layout: "public-layout", siteSection: "public" });
useHead({ title: "Topics and resources | CoderDojo Ennis", meta: [{ name: "description", content: "Explore coding, games, web design, art, 3D, and learning resources used at CoderDojo Ennis." }] });
</script>

<template>
<div>

<PublicPageIntro title="Coding tools and tutorials">
<p class="lead">
					Try these tools to make games, websites, and artwork. Ask a mentor if
					you need help choosing one.
				</p>
</PublicPageIntro>
<section aria-label="Coding topics and tools" class="card-grid card-grid-two">
<PublicCard class="">
<p class="card-number">Scratch</p>
<h2>Animations &amp; first games</h2>
<p>
						Snap blocks together in Scratch to make stories, animations, and
						games.
					</p>
<ul class="resource-list">
<li><a href="https://scratch.mit.edu/">Explore Scratch ↗</a></li>
<li><a href="https://www.code.org">Try Code.org ↗</a></li>
<li>
<a href="https://scratch.mit.edu/projects/44763492/#editor">Club project: broadcast messages ↗</a>
</li>
<li>
<a href="https://scratch.mit.edu/projects/46947730/#editor">Club project: a maze game ↗</a>
</li>
<li>
<a href="https://scratch.mit.edu/projects/56636078/#editor">Club project: guess a number ↗</a>
</li>
</ul>
</PublicCard>
<PublicCard class="">
<p class="card-number">Godot</p>
<h2>Build your own games</h2>
<p>Use Godot to make a game with your own levels and characters.</p>
<ul class="resource-list">
<li><a href="https://godotengine.org">Godot game engine ↗</a></li>
<li>
<a href="https://editor.godotengine.org/releases/latest/">Godot web editor ↗</a>
</li>
<li>
<a href="https://github.com/CoderDojo-Ennis/ScratchyGodot">Our ScratchyGodot project ↗</a>
</li>
<li>
<a href="https://coderdojo-ennis.github.io/MovingOn/Pages/index.html">Moving on from Scratch ↗</a>
</li>
<li><a href="https://opengameart.org/">Open Game Art ↗</a></li>
</ul>
</PublicCard>
<PublicCard class="">
<p class="card-number">Web</p>
<h2>Websites &amp; code</h2>
<p>Build a website, try JavaScript, and save your code on GitHub.</p>
<ul class="resource-list">
<li>
<a href="https://code.visualstudio.com/">Visual Studio Code ↗</a>
</li>
<li><a href="https://github.com/">GitHub ↗</a></li>
<li><a href="https://www.khanacademy.org">Khan Academy ↗</a></li>
<li><a href="https://plnkr.co">Plunkr code playground ↗</a></li>
</ul>
</PublicCard>
<PublicCard class="">
<p class="card-number">Art &amp; 3D</p>
<h2>Art, 3D &amp; electronics</h2>
<p>
						Draw game characters, make 3D models, or try electronics with a
						mentor.
					</p>
<ul class="resource-list">
<li><a href="https://blender.org">Blender for 3D ↗</a></li>
<li>
<a href="https://www.gimp.org/">GIMP for image editing ↗</a>
</li>
<li>
<a href="https://inkscape.org/">Inkscape for vector art ↗</a>
</li>
<li>
<a href="/tutorials/BlenderJackOLantern.pdf">Blender jack-o’-lantern tutorial (PDF)</a>
</li>
<li>
<a href="/pages/assets/BlenderToGodot.zip">Blender to Godot files (ZIP)</a>
</li>
</ul>
</PublicCard>
</section>
<PublicCallToAction>
<h2>Show your project</h2>
<p>
						Bring your project to show-and-tell. You can show the group how it
						works and what you’ve been learning.
					</p>
<template #action>
<NuxtLink class="button" to="/projects">Explore club projects →</NuxtLink>
</template></PublicCallToAction>

</div>
</template>
