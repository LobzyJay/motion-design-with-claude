# 12 Principles of Animation

The Disney canon, distilled for applied motion design. Each principle is a decision tool, not a technique to tick off.

---

## 1. Squash and Stretch

**What it is:** Objects deform in the direction of motion and recover on impact. Volume stays constant.

**When to use:** Physical objects under force: bouncing, impact, weight landing. For UI and brand motion, a subtle version on logos and icons adds life without going cartoon. Scale on one axis while counter-scaling the other.

**Common mistake:** Applying it uniformly across all elements. A typographic headline does not squash and stretch. A bouncing badge does.

---

## 2. Anticipation

**What it is:** A brief motion in the opposite direction before the main action. A character crouches before jumping. A UI element pulls back slightly before launching.

**When to use:** Before any large fast move. It primes the eye and makes the main action read as intentional force rather than sudden teleportation.

**Common mistake:** Skipping it entirely. Most software-default animations have no anticipation. That's why they feel mechanical.

---

## 3. Staging

**What it is:** Every moment in time has one clear read. The audience's eye goes exactly where you need it, not wherever happens to be moving.

**When to use:** Always. In a frame, nothing competes for attention during a transition. If two things move simultaneously, one of them is wrong.

**Common mistake:** Animating all elements at once to "save time." Hierarchy through timing is the solution. See `timing-and-spacing.md`.

---

## 4. Straight Ahead vs. Pose-to-Pose

**What it is:** Two approaches to building an animation. Straight ahead: animate from first frame to last without planning. Pose-to-pose: define the key moments (poses), then fill in between.

**When to use:** In motion design (not character animation), pose-to-pose is almost always right. Define the start state, the peak, and the end state. Then control the spacing between them with easing. Straight ahead works for organic, unpredictable motion (fire, water, particles).

**Common mistake:** Treating this as a character animation concept with no application to motion graphics. It directly maps to keyframe-first vs. procedural-first thinking.

---

## 5. Follow-Through and Overlapping Action

**What it is:** Parts of an object continue to move after the main body stops (follow-through). Different parts of an object move at different rates (overlapping action).

**When to use:** Any multi-part element. A wordmark where letters continue to settle after the lockup lands. A logo where secondary elements lag the primary. Without this, everything stops at exactly the same frame and reads as a grid of simultaneity.

**Common mistake:** All layers hitting their final keyframe at the same time. Every layer in your stack should have a slightly different end point.

---

## 6. Slow In and Slow Out

**What it is:** Motion accelerates at the start and decelerates at the end. The spacing of frames is denser at the beginning and end, sparser in the middle.

**When to use:** This is easing. Always, with intent. See `easing-taxonomy.md` for when to apply which variant.

**Common mistake:** Linear easing. The model's default. The first thing to fix on any AI-generated animation.

---

## 7. Arcs

**What it is:** Natural motion follows curved paths, not straight lines. Eyes, limbs, and pendulums move in arcs. So do elements with physical metaphors.

**When to use:** Position animation where a straight-line path looks mechanical. Set spatial tangent handles in AE to curve the motion path. In Blender, edit the F-curve in the graph editor for curved paths.

**Common mistake:** Ignoring spatial handles entirely and letting AE default to straight-line paths between keyframes.

---

## 8. Secondary Action

**What it is:** A supporting motion that reinforces the main action. A character thinking while walking. A badge pulsing while a modal enters.

**When to use:** When the main animation is long enough to warrant a sub-element providing rhythm or context. Subtle. If the secondary action is more interesting than the primary, something is wrong.

**Common mistake:** Adding secondary action that competes with the primary. If the user's eye follows the secondary, it's staging, not secondary action.

---

## 9. Timing

**What it is:** The number of frames an action takes. More frames = slower, heavier. Fewer frames = faster, lighter. Timing communicates weight and urgency.

**When to use:** Always calibrated to the physical metaphor. A heavy logo should enter slower than a light notification. A system alert should feel faster than an onboarding reveal.

**Common mistake:** Every element at 300ms because it "looks smooth." Duration is a design variable, not a constant.

---

## 10. Exaggeration

**What it is:** Pushing the motion past what would be physically realistic to make it read clearly. Overshoot past the target. Anticipation that's a beat longer than strictly necessary.

**When to use:** Brand and marketing motion, where charm is the goal. Less applicable to product UI where subtlety is expected. The right amount is: more than you think, less than cartoon.

**Common mistake:** Restraint mistaken for quality. Subtle motion isn't always better. Sometimes it just reads as tentative.

---

## 11. Solid Drawing (Solid Design in motion context)

**What it is:** In character animation, understanding 3D form. In motion design: keeping the design coherent as it moves. A logo that looks good in its final position should look intentional at every frame of its entrance.

**When to use:** Always check midpoint frames. At 50% through an animation, the frame should be designerly, not a blur of things in transit.

**Common mistake:** Only checking start and end states. A reveal that looks fine at 0 and 100 can look broken at frame 12.

---

## 12. Appeal

**What it is:** The quality that makes motion feel alive and worth watching. Charisma, not complexity. A simple motion with perfect timing and easing has more appeal than a complex one with defaults.

**When to use:** As a final check. After all other principles are applied, ask: does this motion feel like it was made by someone with taste, or like it was generated by a default setting?

**Common mistake:** Conflating appeal with detail. Adding more effects does not add appeal. Sharpening timing and easing does.
