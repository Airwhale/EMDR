# User Experience Flow

## High-Level State Diagram

```mermaid
stateDiagram-v2
    [*] --> Entry

    Entry --> Learn : "What is this?"
    Entry --> Safety : "I'm ready"
    Learn --> Entry : Back
    Learn --> Safety : "I'm ready to begin"
    Learn --> About : "The science behind it"

    Safety --> Entry : "Go back"
    Safety --> ModeSelect : "I understand, continue"

    ModeSelect --> Session_EMDR : Select EMDR
    ModeSelect --> Session_ART : Select ART
    ModeSelect --> MeditationChoice : Select Meditation
    ModeSelect --> Session_Lateral : Select Lateral

    MeditationChoice --> Session_Meditation : Guided or Silent
    MeditationChoice --> ModeSelect : Back

    Session_EMDR --> EndSummary : Complete
    Session_ART --> EndSummary : Complete
    Session_Meditation --> Entry : Complete
    Session_Lateral --> Entry : Exit

    Session_EMDR --> Entry : Exit early
    Session_ART --> Entry : Exit early
    Session_Meditation --> Entry : Exit early

    EndSummary --> Entry : "New session"
    EndSummary --> About : "How it works"
    About --> Entry : Back
    About --> EndSummary : Back (if came from summary)
```

---

## Screen-by-Screen Breakdown

### 1. Entry

```
+--------------------------------------------------+
|                                                  |
|            . (slow-moving EMDR dot)              |
|                                                  |
|     EMDR / ART Self-Administered Experience      |
|                                                  |
|  Find a comfortable position. Put on headphones  |
|  for the full experience.                        |
|                                                  |
|       [ I'm ready ]   [ What is this? ]          |
|                  [ Full screen ]                  |
|                                                  |
|  This experience draws on select techniques...   |
|  emdria.org  |  emdrhap.org (pro bono)           |
+--------------------------------------------------+
```

**Appears with staggered timing:** text at 2s, buttons at 4s.

---

### 2. Learn (Educational Content)

Scrollable page covering: What is this? | What is EMDR? | What is ART? | Why do this? | How long? | Important note.

Buttons: **"I'm ready to begin"** | **"The science behind it"** (-> About page)

---

### 3. Safety Gate

```
+--------------------------------------------------+
|                                                  |
|              Before you begin                    |
|                                                  |
|  EMDR and ART are clinical therapies. This is    |
|  a simplified self-guided version.               |
|                                                  |
|  - Use in a safe, private setting                |
|  - You can exit anytime (top left)               |
|  - Strong emotions may come up (normal)          |
|                                                  |
|  Call or text 988 for 24/7 crisis support        |
|                                                  |
|         [ Go back ]  [ I understand ]            |
+--------------------------------------------------+
```

---

### 4. Mode Select

```
+--------------------------------------------------+
|                                                  |
|          Choose your experience                  |
|                                                  |
|  Binaural tones: [ON / off]                      |
|                                                  |
|  [ EMDR          - Build calm & resources      ] |
|  [ ART           - Rescript a stressful memory ] |
|  [ MEDITATION    - Deep hypnotic relaxation    ] |
|  [ LATERAL       - Customizable BLS tool       ] |
|                                                  |
|  > not sure? click to find out more              |
+--------------------------------------------------+
```

---

### 5. Meditation Choice (meditation only)

```
+--------------------------------------------------+
|                                                  |
|       Choose your meditation style               |
|                                                  |
|  [ GUIDED  - voice, breathing, countdown       ] |
|  [ SILENT  - visuals & binaural only           ] |
|                                                  |
|  Visual flickering: [on / OFF]                   |
|  Binaural tones always on. Headphones recommended|
|                                                  |
|  < Back                                          |
+--------------------------------------------------+
```

---

## Session Flows

### EMDR Session

```mermaid
stateDiagram-v2
    [*] --> SUD_Check_Pre

    SUD_Check_Pre --> Grounding : SUD > 5 (first time)
    SUD_Check_Pre --> PostGrounding : SUD > 5 (already grounded)
    SUD_Check_Pre --> AdverseEvent : SUD = 10
    SUD_Check_Pre --> Centering : SUD <= 5

    Grounding --> SUD_Check_Pre : Complete (re-check)
    PostGrounding --> Centering : Continue
    PostGrounding --> Exit : Exit
    AdverseEvent --> CrisisResources : terminal — no exit button

    Centering --> SafePlace
    SafePlace --> SafePlace_BLS : "I'm ready"
    SafePlace_BLS --> ButterflyHug : Continue
    ButterflyHug --> Container : Complete
    Container --> Container_BLS : "I'm ready"
    Container_BLS --> Resource : Continue
    Resource --> Resource_BLS : "I'm ready"
    Resource_BLS --> BodyScan : Continue
    BodyScan --> Closing
    Closing --> SUD_Check_Post
    SUD_Check_Post --> EndSummary
```

**Exercises completed:** Safe Place, Butterfly Hug, Container, Resource Installation, Body Scan

**Duration:** ~10-15 minutes

---

### ART Session

```mermaid
stateDiagram-v2
    [*] --> Centering
    Centering --> SceneSelect
    SceneSelect --> SUD_Initial

    SUD_Initial --> Grounding : SUD > 5 (first time)
    SUD_Initial --> PostGrounding : SUD > 5 (already grounded)
    SUD_Initial --> AdverseEvent : SUD = 10
    SUD_Initial --> Processing : SUD <= 6

    Grounding --> SUD_Initial : Complete (re-check)
    PostGrounding --> Processing : Continue
    PostGrounding --> Exit : Exit
    AdverseEvent --> CrisisResources : terminal — no exit button

    Processing --> SensationCheck : Continue (after ~35s BLS)
    SensationCheck --> SensationBLS : "I'm ready"
    SensationBLS --> VIR_Prompt : Continue
    VIR_Prompt --> VIR_BLS : "I'm ready"
    VIR_BLS --> SUD_Recheck : Continue

    SUD_Recheck --> Processing : SUD 3-9 (next round)
    SUD_Recheck --> BodyScan : SUD <= 2
    SUD_Recheck --> AdverseEvent : SUD = 10

    BodyScan --> Closing
    Closing --> SUD_Final
    SUD_Final --> EndSummary
```

**Key feature:** Processing loop repeats until distress drops to 2 or below.

**Duration:** ~10-20 minutes (varies by rounds needed)

---

### Meditation Session

```mermaid
stateDiagram-v2
    state "Guided Mode" as guided {
        [*] --> Centering_G
        Centering_G --> Fixation : ~48s
        Fixation --> Deepening : ~2min
        Deepening --> Staircase : ~2min
        Staircase --> Sustain : Count 1-10
    }

    state "Silent Mode" as silent {
        [*] --> Sustain_S : Skip to sustain
    }

    state "Sustain (core phase)" as sustain_detail {
        state "Loops indefinitely" as loop
        loop : - 16 thematic cues cycle
        loop : - Binaural deepens over time
        loop : - Anchoring reinforcement at 30s, 10m, 15m
        loop : - Heartbeat slows 60 -> 45 bpm
        loop : - User stays as long as desired
    }

    Sustain --> sustain_detail
    Sustain_S --> sustain_detail

    sustain_detail --> Emergence : User clicks exit
    Emergence --> Complete : ~30s fade
    Complete --> [*] : Return to Entry
```

**Duration:** User-controlled, up to 2 hours. Guided adds ~7 min of induction before sustain.

---

### Lateral Session (Open-ended Tool)

```
+--------------------------------------------------+
| <- exit                        show/hide controls|
|                                                  |
|                                                  |
|             .  <---- moving dot ---->  .         |
|                                                  |
|                                                  |
|                                                  |
|                                                  |
|  +--------------------------------------------+  |
|  | Dot Speed     [=====|===========]          |  |
|  | Binaural Hz   [==|=====================]   |  |
|  | Binaural Vol  [===============|=========]  |  |
|  | Ping Sound    [===|====================]   |  |
|  | Pink Noise    [|========================]  |  |
|  +--------------------------------------------+  |
|                   3:42                           |
+--------------------------------------------------+
```

**No fixed duration.** User exits when ready. No end summary.

---

## End Summary (EMDR & ART only)

```
+--------------------------------------------------+
|                                                  |
|         {Mode} Session Complete                  |
|         Here's a summary of your session         |
|         April 8, 2026                            |
|                                                  |
|         Before:  7/10                            |
|         After:   3/10  (4 points improvement)    |
|                                                  |
|  Exercises / Rounds completed: ...               |
|                                                  |
|  [Educational text about the mode]               |
|  [Validation message]                            |
|                                                  |
|  Recent sessions:                                |
|  - EMDR  7 -> 3  Apr 8                          |
|  - ART   8 -> 2  Apr 7                          |
|  [Clear session history]                         |
|                                                  |
|  Crisis resources: 988 | Text HOME to 741741    |
|  emdria.org | emdrhap.org                        |
|                                                  |
|       [ New session ]   [ How it works ]         |
+--------------------------------------------------+
```

---

## Safety & Crisis Paths

```mermaid
flowchart TD
    A[SUD Check] -->|"SUD > 5"| B{Grounded before?}
    B -->|No| C[Grounding Exercise]
    C --> A
    B -->|Yes| D[Post-Grounding Message]
    D -->|Continue| E[Proceed with session]
    D -->|Exit| F[Return to Entry]

    A -->|"SUD = 10"| G[Adverse Event Protocol]
    G --> F

    H[End Summary] --> I[Crisis Resources]
    I --> J["988 Suicide & Crisis Lifeline"]
    I --> K["Text HOME to 741741"]
    I --> L["emdria.org / emdrhap.org"]
```

---

## Audio System Across Modes

| Component | Meditation | EMDR | ART | Lateral |
|-----------|-----------|------|-----|---------|
| Binaural tones | Always on, deepens over time | Optional (toggle) | Optional (toggle) | User-controlled |
| Pink noise | Yes (depth-scaled) | Light background | Light background | User-controlled |
| Ping sounds | No | Bilateral taps | Bilateral taps | User-controlled |
| Heartbeat | Yes (slows over session) | No | No | No |
| Isochronic pulse | Yes | No | No | No |
| 2nd binaural layer | Yes | No | No | No |
| Voice narration | Guided only | Yes | Yes | No |
| Breath cues | Yes (guided) | No | No | No |

---

## Navigation Summary

| From | To | Trigger |
|------|----|---------|
| Entry | Learn | "What is this?" |
| Entry | Safety | "I'm ready" |
| Learn | Entry | Back |
| Learn | Safety | "I'm ready to begin" |
| Learn | About | "The science behind it" |
| Safety | Entry | "Go back" |
| Safety | Mode Select | "I understand, continue" |
| Mode Select | Session | Select EMDR / ART / Lateral |
| Mode Select | Meditation Choice | Select Meditation |
| Meditation Choice | Session | Guided / Silent |
| Meditation Choice | Mode Select | Back |
| Any Session | Entry | Exit button (top-left) |
| EMDR / ART Session | End Summary | Session complete |
| Meditation Session | Entry | Session complete |
| End Summary | Entry | "New session" |
| End Summary | About | "How it works" |
| About | Entry or End Summary | Back (smart routing) |
