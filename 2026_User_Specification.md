# STEMM Lab – User Specification (2026)

> **Project Concept:** STEMM Lab – A Real-World STEMM Games App

STEMM Lab is a mobile app that transforms real-world physical activities into engaging, game-based **Science, Technology, Engineering, Mathematics, and Medicine (STEMM)** learning experiences. Students complete hands-on challenges using everyday materials, their bodies, and their surroundings, while the app captures data using the phone's camera, sensors, GPS, timers, and analytics.

For each activity, students upload videos, record results, rate the activity, and comment on outcomes, with GPS location tagging enabled. Teams compete on leaderboards, receive timed challenges, and iteratively improve their designs like real scientists and engineers.

**Target Audience:** Upper Primary School and lower High School students.

---

## App Start-Up

On first launch, students register their team by entering:

- **Team Name**
- **First Name of Each Team Member**
- **Grade or Year Level**
- **Team Discriminator** *(Assigned automatically by the app)*

---

## Table of Contents

1. [Engineering Challenges](#engineering-challenges)
   - [Activity 1: Parachute Drop Challenge](#activity-1-parachute-drop-challenge)
   - [Activity 2: Sound Pollution Hunter](#activity-2-sound-pollution-hunter)
   - [Activity 3: Hand Fan Challenge](#activity-3-hand-fan-challenge)
   - [Activity 4: Earthquake-Resistant Structure](#activity-4-earthquake-resistant-structure)
2. [Health and Medical Sciences](#health-and-medical-sciences)
   - [Activity 5: Human Performance Lab – Stretch Speed & Gracefulness](#activity-5-human-performance-lab--stretch-speed--gracefulness)
   - [Activity 6: Reaction Board Challenge](#activity-6-reaction-board-challenge)
   - [Activity 7: Breathing Pace Trainer](#activity-7-breathing-pace-trainer)

---

## Engineering Challenges

---

### Activity 1: Parachute Drop Challenge

**Category:** Engineering + Physics

#### Overview

Students design, build, and test a parachute for a small toy to reduce its landing speed and impact force. Teams iterate their designs under time and material constraints, aiming to achieve the slowest and safest landing within a target area.

#### Equipment

- Mobile phone with STEMM Lab app
- Small toy (e.g. army toy soldier)
- Table or elevated surface
- Paper or plastic
- String
- Scissors
- Tape

#### Instructions

1. Drop the toy without a parachute and record the fall (baseline test).
2. Build a parachute using provided materials.
3. Drop the toy from the same height and record the fall.
4. Review speed and landing accuracy results in the app.
5. Redesign and test up to three prototypes within 20 minutes.
6. Upload videos, results, and team reflections.

#### Write-Up (on paper)

- Predict which parachute design was the best.
- Sketch each design.
- Record the times of each design.
- Were you correct in your timings?
- What design was the easiest to make?

**Data Table:**

| Action | Predicted time to hit ground | Actual time to first hit ground | Were you right? | Time from first hit to stop moving (slow-motion) |
|---|---|---|---|---|
| Action 1 – No parachute (baseline) | | | | |
| Action 2 – e.g. plastic with four corners tied to toy | | | | |
| Action 3 | | | | |

---

#### Discussion: Parachutes and Forces

Gravity pulls objects downward, causing them to speed up as they fall. A parachute increases **air resistance (drag)**. Drag acts upward, opposing the motion and slowing the fall. A slower fall reduces the force when the toy hits the ground, making the landing safer. Engineers improve parachute designs through repeated testing and redesign.

**Forces Acting on the Toy:**

| Force | Formula |
|---|---|
| Downward (weight) | `Weight = mass × g` |
| Upward (drag) | Drag force from the parachute |
| Net (total) force | `Net Force = Weight − Drag Force` |

**Newton's Second Law:**
```
Net Force = mass × acceleration
```

#### Calculations

**Step 1: Measure the Drop Height**
Measure the height of the table or drop surface (distance fallen).

**Step 2: Measure the Time**
Drop the toy (do not throw it). Record the time taken to first hit the ground using a phone timer or video.

**Step 3: Calculate Final Velocity**
Since the toy is dropped, initial velocity = 0 m/s.
```
Final velocity = distance / time
Example: 1.0 m / 0.5 s = 2.0 m/s
```

**Step 4: Calculate Acceleration**
```
Acceleration = (Final velocity − Initial velocity) / time
Example: Acceleration = 2.0 / 0.5 = 4.0 m/s²
```

**Step 5: Calculate Net Force**
```
Net Force = mass × acceleration
Example (mass = 0.20 kg): Net Force = 0.20 × 4.0 = 0.8 N
```

**Step 6: Calculate Drag Force**
```
Weight = mass × g = 0.20 × 9.8 = 1.96 N
Drag Force = Weight − Net Force = 1.96 − 0.8 = 1.16 N
```

#### G-Force (Stopping Acceleration)

G-force describes how quickly the object slows down when it hits the ground, measured in multiples of `g = 9.8 m/s²`.

**Using the STEMM App Slow-Motion Video:**
- Identify the moment the toy first hits the ground.
- Measure the time taken for the toy to stop moving (contact time).

**Case 1 – Object Does Not Bounce:**
```
Δv = v_impact
g-force = (Δv / t_contact) ÷ 9.8

Example: Impact speed = 2.0 m/s, Contact time = 0.05 s
g-force = (2.0 / 0.05) ÷ 9.8 ≈ 4.1 g
```

**Case 2 – Object Bounces:**
```
Δv = v_impact + v_up
g-force = (Δv / t_contact) ÷ 9.8

Finding v_up if rebound height is unknown:
  Measure time to maximum height after bounce (t_up) using slow-motion video.
  v_up = g × t_up

Example:
  Impact speed downward: 2.0 m/s
  Time to max height after bounce: 0.15 s → v_up = 9.8 × 0.15 ≈ 1.47 m/s
  Contact time: 0.02 s
  Δv = 2.0 + 1.47 = 3.47 m/s
  g-force = (3.47 / 0.02) ÷ 9.8 ≈ 17.7 g
```

> **Observation:** Bouncing increases g-force because the velocity change during contact is larger.

**G-Force Summary Table:**

| Case | Δv | g-force formula |
|---|---|---|
| No bounce | `v_impact` | `g = v_impact / t_contact ÷ 9.8` |
| Bounce | `v_impact + v_up` | `g = (v_impact + v_up) / t_contact ÷ 9.8` |

**Tips for slow-motion video:**
- Use a ruler in frame for scale.
- Identify first contact for contact time.
- Identify when object leaves surface for bounce calculation.

**Typical G-Force Ranges and Injury Risk:**

| G-Force Range | Examples | Likely Effects |
|---|---|---|
| 1–5 g | Standing up quickly, elevators, amusement rides | No injury |
| 5–10 g | Hard falls while running, minor car braking | Possible bruising or strains |
| 10–30 g | Sports collisions, bicycle crashes, car crashes with seatbelts | Serious injuries possible (broken bones, concussions) |
| 30–50 g | Severe car crashes, falls onto hard surfaces | High risk of severe injury |
| 50+ g | Very sudden stops with no cushioning | Life-threatening injuries likely |

> **Important:** Duration matters. A brief spike can be survivable, while sustained g-forces are more dangerous.

#### Student Focus

**Primary School students:**
- Measure time
- Calculate final speed

**High School students:**
- Calculate final velocity
- Calculate acceleration
- Calculate net force
- Calculate drag force
- Calculate g-force

#### Curriculum Links

| Subject | Code | Description |
|---|---|---|
| Science | ACSSU076 / ACSSU117 | Forces affect motion |
| Science | ACSIS124 | Planning and conducting investigations |
| Science | ACSIS126 | Analysing patterns in data |
| Design & Technologies | ACTDEP036 | Generate, test, and improve solutions |
| Mathematics | ACMMG108 | Measuring speed |
| Mathematics | ACMSP147 | Comparing data and averages |

---

### Activity 2: Sound Pollution Hunter

**Category:** Environmental Science

#### Overview

Students measure and compare sound levels in different classroom activities.

#### Equipment

- Mobile phone with STEMM Lab app

#### Instructions

1. Measure noise from different actions (dropping objects — pens, books — talking, walking, stamping your feet).
2. Record sound levels and locations.
3. Map loud and quiet zones.

#### Write-Up (on paper)

- Predict which action created the loudest sound.
- Record the results.
- Were you right? Any surprises?
- Should we wear ear muffs in your classroom?

**Data Table:**

| Action | Prediction (louder or softer than) | Outcome (dB) | Were you right? |
|---|---|---|---|
| Action 1 – e.g. dropping a book on the table | | | |
| Action 2 | | | |
| Action 3 | | | |

#### Discussion

Sound intensity varies depending on energy and surfaces. Prolonged loud noise can impact health and concentration.

**Sound Levels and Hearing Damage Risk:**

| Sound Level (dB) | Example Sounds | Risk to Hearing |
|---|---|---|
| 0–30 dB | Whisper, quiet library | No risk |
| 30–60 dB | Normal conversation, classroom noise | Safe for long periods |
| 60–85 dB | Busy traffic, vacuum cleaner | Generally safe, but long exposure can cause fatigue |
| 85–90 dB | Lawn mower, loud classroom, heavy traffic | **Hearing damage possible** after long exposure |
| 90–100 dB | Motorbike, power tools, loud music | **Hearing damage likely** after short exposure |
| 100–110 dB | Nightclub, rock concert, chainsaw | **Serious hearing damage** in minutes |
| 110–120 dB | Siren close by, car horn at 1 m | Painful; **immediate damage possible** |
| 120–130 dB | Jet engine at close range | **Immediate and severe hearing damage** |
| 140+ dB | Explosion, gunshot | **Instant, permanent hearing damage** |

#### Curriculum Links

| Subject | Code | Description |
|---|---|---|
| Science | ACSSU073 | Sound and energy |
| Health | ACPPS053 | Health and wellbeing |

---

### Activity 3: Hand Fan Challenge

**Category:** Physics – Air Movement

#### Overview

Students test how air movement affects flexible materials.

#### Equipment

- Paper and cardboard
- Scissors
- Mobile phone
- Sticky tape
- STEMM Lab app

#### Instructions

1. Stand paper upright on a table.
2. Fan air from 30 cm away.
3. Observe and record movement.
4. Repeat with different fan designs and fan distances (15 cm, 30 cm, 45 cm).
5. Repeat with cardboard instead of paper as the vertical material.

#### Write-Up (on paper)

- Predict which fan design makes the paper move the most.
- Record the results.
- Were you right? Any surprises?
- How does **material stiffness** affect the bend angle?
- How does **fan design** influence air velocity and resulting paper movement?
- How does **distance from the fan** affect bending?

**Data Table:**

| Design | Predicted bend (degrees) | Outcome (degrees) | Observation notes |
|---|---|---|---|
| Design 1 – e.g. 1 cm back-and-forward folds | 30° | | |
| Design 2 – e.g. no folds | | | |
| Design 3 | | | |

#### Discussion

Moving air applies force to objects. Paper bends due to flexibility (plasticity), and repeated bending can weaken it.

**Force estimation tip:** Approximate force using `F ≈ k × θ`. Students can rank forces by stiffness and bend angle without exact units if needed.

#### Optional Challenge: Estimating Stiffness Coefficient k

For bending a sheet of paper, the approximation is:
```
F ≈ k × θ

Where:
  F = force applied (N)
  θ = bend angle (radians)
  k = stiffness coefficient (resistance to bending)
```

**Approximate k values for different paper types:**

| Material | Thickness (mm) | Stiffness k (N/rad) | Notes |
|---|---|---|---|
| Thin printer paper | 0.1 | 0.05 | Bends very easily |
| Standard card stock | 0.25 | 0.2 | Moderate bend |
| Thin cardboard | 0.5 | 0.5 | Much harder to bend |
| Corrugated cardboard | 3 | 2–3 | Very stiff, almost no bend |

**Example Calculation:**
```
Thin paper: k = 0.05 N/rad, bend angle = 30° → θ = 0.524 rad
F ≈ 0.05 × 0.524 ≈ 0.026 N

Thick cardboard: k = 0.5, same bend angle:
F ≈ 0.5 × 0.524 ≈ 0.26 N
```

> The force required increases strongly with material stiffness.

#### Curriculum Links

| Subject | Code | Description |
|---|---|---|
| Science | ACSSU076 | Forces and motion |

---

### Activity 4: Earthquake-Resistant Structure

**Category:** Engineering + Earth Science

#### Overview

Students design structures that withstand vibration, simulating earthquakes.

#### Equipment

- Cardboard, paper, scissors, sticky tape, plastic/paper cups
- Mobile phone with vibration sensor

#### Instructions

1. Build an anti-vibration layer by folding paper/cardboard.
2. Place a flat cardboard platform on top.
3. Place the phone in the centre and activate vibration mode on the STEMM App.
4. Modify the structure to reduce movement (e.g. more pillars, more folds, etc.).

#### Write-Up (on paper)

- Predict which fold design makes the phone move the least.
- Record the results.
- Were you right? Any surprises?

**Data Table:**

| Design | Predicted phone movement | Outcome (mm) | Were you right? |
|---|---|---|---|
| Design 1 – e.g. 4 folds + 4 pillars | e.g. ±1 cm | 4 cm | |
| Design 2 – e.g. 10 folds + 4 pillars | | | |
| Design 3 – e.g. 3 folds + 6 pillars | | | |

#### Discussion

Earthquakes cause ground vibrations that can collapse poorly designed structures. Engineers design buildings to absorb and distribute energy safely.

#### Curriculum Links

| Subject | Code | Description |
|---|---|---|
| Science | ACSSU096 | Earth processes |
| Design & Technologies | ACTDEP036 | Testing and improving designs |

---

## Health and Medical Sciences

---

### Activity 5: Human Performance Lab – Stretch Speed & Gracefulness

**Category:** Medical Science + Biomechanics

#### Overview

Students investigate how the human body moves by measuring speed, smoothness, and coordination during controlled stretching activities.

#### Equipment

- Mobile phone with STEMM Lab app
- Open space to move safely

#### Instructions

1. Hold the phone firmly in one hand. Activate the app vibration sensor.
2. Perform guided movement slowly as shown in the app. Record the vibration.
3. Repeat the activity with vibration feedback enabled.
4. Review speed, smoothness, and range-of-motion data.
5. Upload results and reflect as a group.

**Three movements are performed:** Movement 1, Movement 2, Movement 3 *(shown as diagrams in original document).*

#### Write-Up (on paper)

- Which movement was the hardest to keep the vibration low?
- Record the results.
- Were you right? Any surprises?

**Data Table:**

| Attempt | Predicted phone vibration | Outcome (time + movement) | Were you right? |
|---|---|---|---|
| Attempt 1 | e.g. ±1 cm | 5 mm in 20 seconds | |
| Attempt 2 | | 5 mm in 5 seconds | |
| Attempt 3 | | | |

#### Discussion

Muscles and joints work together to create movement. Faster movements often reduce control, while smoother movements show better coordination. Sensors in the phone measure how quickly and smoothly the body moves, helping students understand biomechanics and fatigue.

#### Curriculum Links

| Subject | Code | Description |
|---|---|---|
| Health & Physical Education | ACPPS051 | Movement skills |
| Health & Physical Education | ACPPS054 | Physical performance |
| Science (Biology) | ACSSU176 | Structure and function of body systems |

---

### Activity 6: Reaction Board Challenge

**Category:** Neuroscience + Mathematics

#### Overview

Students measure reaction time, coordination, and improvement through repeated digital and physical challenges.

#### Equipment

- Mobile phone with STEMM Lab app
- Clear working space

#### Instructions

**Phase 1 – Tap Reaction:**
1. Tap the screen as soon as the hidden button appears.
2. Record reaction time.
3. Rotate through each team member.

**Phase 2 – Swap Hands:**
4. Repeat using the non-dominant hand.
5. Compare results.
6. Rotate through each team member.

**Phase 3 – Tracing Challenge:**
7. Trace a moving shape on the screen.
8. Review accuracy and delay.
9. Rotate through each team member.

#### Write-Up (on paper)

- Predict your reaction time.
- Record the results.
- Were you right? Any surprises?

**Data Table:**

| Attempt | Reaction time prediction | Outcome (time + movement) | Were you right? |
|---|---|---|---|
| Attempt 1 | e.g. ±1 cm | 6 seconds delay | |
| Attempt 2 | | 3 seconds delay | |
| Attempt 3 | | | |

#### Discussion

Reaction time measures how quickly the brain processes information and sends signals to muscles. Practice can improve speed and coordination. Comparing hands shows how dominance affects performance.

#### Curriculum Links

| Subject | Code | Description |
|---|---|---|
| Science Inquiry | ACSIS130 | Collecting and analysing data |
| Mathematics | ACMSP147 | Averages and variation |
| Health | ACPPS057 | Understanding physical performance |

---

### Activity 7: Breathing Pace Trainer

**Category:** Medical Science

#### Overview

Students analyse breathing patterns at rest and after exercise.

#### Equipment

- Mobile phone with STEMM Lab app
- Flat surface or mat

#### Instructions

1. Place the phone gently on the chest.
2. Record breathing at rest.
3. Perform light exercise:
   - Jog one minute on the spot.
   - 100 star jumps.
4. Record breathing again and compare results.
5. Rotate for each team member.

#### Write-Up (on paper)

- Predict your breaths per minute for each condition.
- Record the results.
- Were you right? Any surprises?

**Data Table:**

| Condition | Predicted breaths per minute | Outcome (time + movement) | Were you right? |
|---|---|---|---|
| Breathing at Rest | e.g. 6 breaths per minute | | |
| After Exercise 1 | | | |
| After Exercise 2 | | | |

#### Discussion

Breathing rate increases during exercise to supply more oxygen to muscles. Sensors detect chest movement, helping students visualise breathing patterns.

#### Curriculum Links

| Subject | Code | Description |
|---|---|---|
| Science | ACSSU176 | Body systems |
| Health | ACPPS054 | Physical activity and health |

---

## Activity Summary Reference

| # | Activity | Category | Key Sensor | Key Measurement |
|---|---|---|---|---|
| 1 | Parachute Drop Challenge | Engineering + Physics | Camera (slow-motion video) | Drop time, velocity, drag force, g-force |
| 2 | Sound Pollution Hunter | Environmental Science | Microphone | Sound level (dB) |
| 3 | Hand Fan Challenge | Physics – Air Movement | Accelerometer | Bend angle (degrees) |
| 4 | Earthquake-Resistant Structure | Engineering + Earth Science | Accelerometer (vibration) | Vibration amplitude (mm) |
| 5 | Human Performance Lab | Medical Science + Biomechanics | Accelerometer (vibration) | Smoothness score, movement time |
| 6 | Reaction Board Challenge | Neuroscience + Mathematics | Touchscreen timer | Reaction time (ms) |
| 7 | Breathing Pace Trainer | Medical Science | Accelerometer (chest movement) | Breaths per minute, amplitude |

---

*End of STEMM Lab 2026 User Specification*
