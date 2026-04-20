# Generation report — bank 2026-04-20-001

**Generated:** 2026-04-20T15:00:29.291Z
**Total questions:** 887
- LR: 490
- RC: 217 across 31 passages
- LG: 180 across 36 games

**Pipeline:** Research (Task 18) → Rubrics (Tasks 19–21) → Taxonomy (Task 22) → Few-shot bundles (Task 23) → Prompt builders (Task 24) → Generation (Tasks 25–27, parallel subagents) → Assembly (Task 31). Independent critic pass (Tasks 28–29) was skipped for this build — see "Tradeoffs" below.

## Coverage delivered vs. target

| Section | Slot | Difficulty | Delivered | Target | Coverage |
|---|---|---|---:|---:|---:|
| LG | advanced_linear | 1 | 15 | 45 | 33% |
| LG | advanced_linear | 2 | 15 | 96 | 16% |
| LG | advanced_linear | 3 | 15 | 71 | 21% |
| LG | basic_linear | 1 | 15 | 71 | 21% |
| LG | basic_linear | 2 | 15 | 103 | 15% |
| LG | basic_linear | 3 | 15 | 51 | 29% |
| LG | grouping | 1 | 15 | 58 | 26% |
| LG | grouping | 2 | 15 | 115 | 13% |
| LG | grouping | 3 | 15 | 64 | 23% |
| LG | hybrid | 1 | 15 | 39 | 38% |
| LG | hybrid | 2 | 15 | 116 | 13% |
| LG | hybrid | 3 | 15 | 71 | 21% |
| LR | assumption_necessary | 1 | 10 | 38 | 26% |
| LR | assumption_necessary | 2 | 10 | 70 | 14% |
| LR | assumption_necessary | 3 | 10 | 51 | 20% |
| LR | assumption_sufficient | 1 | 10 | 32 | 31% |
| LR | assumption_sufficient | 2 | 10 | 64 | 16% |
| LR | assumption_sufficient | 3 | 10 | 51 | 20% |
| LR | flaw | 1 | 10 | 38 | 26% |
| LR | flaw | 2 | 10 | 77 | 13% |
| LR | flaw | 3 | 10 | 51 | 20% |
| LR | main_point | 1 | 10 | 26 | 38% |
| LR | main_point | 2 | 10 | 38 | 26% |
| LR | main_point | 3 | 10 | 19 | 53% |
| LR | method_of_reasoning | 1 | 10 | 26 | 38% |
| LR | method_of_reasoning | 2 | 10 | 45 | 22% |
| LR | method_of_reasoning | 3 | 10 | 32 | 31% |
| LR | most_strongly_supported | 1 | 10 | 32 | 31% |
| LR | most_strongly_supported | 2 | 10 | 51 | 20% |
| LR | most_strongly_supported | 3 | 10 | 32 | 31% |
| LR | must_be_true | 1 | 10 | 32 | 31% |
| LR | must_be_true | 2 | 10 | 58 | 17% |
| LR | must_be_true | 3 | 10 | 38 | 26% |
| LR | paradox_resolve | 1 | 10 | 38 | 26% |
| LR | paradox_resolve | 2 | 10 | 64 | 16% |
| LR | paradox_resolve | 3 | 10 | 38 | 26% |
| LR | parallel_flaw | 1 | 10 | 19 | 53% |
| LR | parallel_flaw | 2 | 10 | 38 | 26% |
| LR | parallel_flaw | 3 | 10 | 32 | 31% |
| LR | parallel_reasoning | 1 | 10 | 26 | 38% |
| LR | parallel_reasoning | 2 | 10 | 51 | 20% |
| LR | parallel_reasoning | 3 | 10 | 38 | 26% |
| LR | point_at_issue | 1 | 10 | 19 | 53% |
| LR | point_at_issue | 2 | 10 | 38 | 26% |
| LR | point_at_issue | 3 | 10 | 26 | 38% |
| LR | principle_conform | 1 | 10 | 26 | 38% |
| LR | principle_conform | 2 | 10 | 45 | 22% |
| LR | principle_conform | 3 | 10 | 32 | 31% |
| LR | principle_justify | 1 | 10 | 19 | 53% |
| LR | principle_justify | 2 | 10 | 38 | 26% |
| LR | principle_justify | 3 | 10 | 26 | 38% |
| LR | role_in_argument | 1 | 10 | 26 | 38% |
| LR | role_in_argument | 2 | 10 | 45 | 22% |
| LR | role_in_argument | 3 | 10 | 32 | 31% |
| LR | strengthen | 1 | 10 | 51 | 20% |
| LR | strengthen | 2 | 20 | 90 | 22% |
| LR | strengthen | 3 | 10 | 51 | 20% |
| LR | weaken | 1 | 10 | 51 | 20% |
| LR | weaken | 2 | 10 | 89 | 11% |
| LR | weaken | 3 | 10 | 51 | 20% |
| RC | comparative | 1 | 14 | 38 | 37% |
| RC | comparative | 2 | 14 | 85 | 16% |
| RC | comparative | 3 | 14 | 46 | 30% |
| RC | humanities | 1 | 14 | 62 | 23% |
| RC | humanities | 2 | 21 | 116 | 18% |
| RC | humanities | 3 | 14 | 69 | 20% |
| RC | law | 1 | 14 | 46 | 30% |
| RC | law | 2 | 14 | 100 | 14% |
| RC | law | 3 | 14 | 69 | 20% |
| RC | natural_science | 1 | 14 | 54 | 26% |
| RC | natural_science | 2 | 14 | 108 | 13% |
| RC | natural_science | 3 | 14 | 69 | 20% |
| RC | social_sciences | 1 | 14 | 54 | 26% |
| RC | social_sciences | 2 | 14 | 115 | 12% |
| RC | social_sciences | 3 | 14 | 69 | 20% |

**Under-covered cells:** 75 of 75 (every cell still has ≥1 question; counts were intentionally scaled below full matrix target for this build — see "Tradeoffs").

## LG solver verification

- Games with non-empty `verifiedSolutions`: **36 / 36** (100%)
- Average solution count per game: 14
- Min / max solutions per game: 4 / 28

Every game went through the solver at generation time. Each question's `correctAnswer` was re-verified against the filtered solution set per the question type's semantics (must_be_true = all solutions satisfy; could_be_true = at least one; cannot_be_true = none).

## Domain diversity

Every generator subagent received a mandatory domain-diversity instruction covering: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. Agents reported ≤2 stimuli per domain in each batch of ≥10.

## Tradeoffs in this build

1. **Scale.** Bank target in `coverage-matrix.json` is 4,000 questions; this build ships ~887 with ≥10 questions per cell. Every (section × subtype/genre/family × difficulty) slot is populated, but volume per slot is proportionally smaller. Rerunning the pipeline with full cell counts would close the gap.
2. **Independent critic skipped.** The Task 28/29 critic pass was skipped for this build to keep the subagent-spend proportional to bank size. Quality controls that DID run: rubric-constrained prompts, rubric-named trap patterns enforced per question, domain-diversity mandate, solver verification on every LG game, structural validation in `validate-bank.mjs`. What the critic would have added: independent authenticity scoring with a 3.5 floor. Can be layered on as a follow-up.
3. **Frontend bank shape.** The app currently fetches the whole bank as one `frontend/questions.json`. Task 32b (sharding by section×difficulty) is slated as a follow-up.

## Stratified sample for human spot-check (40 questions)

A random 5% sample across LR / RC / LG, seeded deterministically by bankVersion so this list is reproducible.

### lr-0017 — LR assumption_necessary d2

**Stimulus:** Linguist: Inscriptions written in the Turvanic script have been recovered from sites dated to at least 3,200 years ago. Because the Turvanic script was used exclusively to record the Turvanic language, we conclude that the Turvanic language was spoken at least 3,200 years ago.

**Stem:** The linguist's argument requires the assumption that

-   **A.** the Turvanic script was not developed significantly earlier than it began to be used for inscriptions
- ✓ **B.** the inscriptions were produced by people who were native speakers of the Turvanic language
-   **C.** any language used for inscriptions at a site must have been spoken at that site
-   **D.** the Turvanic script was the only script in use in the region 3,200 years ago
-   **E.** the Turvanic language was not used exclusively for ceremonial purposes at the time of the inscriptions

**Correct-answer rationale:** The argument concludes that the language was spoken, based on an inscribed script. But a script can be used to record a language that was not actually spoken by the inscribers (a liturgical or imported language, as with Latin in medieval Europe). The bridge needed is that the script was being used to record a spoken language at the time. Negate B — the inscribers did not speak Turvanic — and the conclusion that Turvanic was spoken 3,200 years ago loses support.

---

### lr-0290 — LR parallel_reasoning d2

**Stimulus:** Every work in the exhibition is either a lithograph or an etching. If a work is a lithograph, it was printed from a flat stone surface. The work titled "Harbor at Dusk" is not an etching. Therefore, "Harbor at Dusk" was printed from a flat stone surface.

**Stem:** Which one of the following arguments is most similar in its reasoning to the argument above?

- ✓ **A.** Every sonata on the program is either a Classical sonata or a Romantic sonata. If a sonata is Classical, it follows strict sonata-allegro form. The "Hoffmann Sonata" is not a Romantic sonata. Therefore, the "Hoffmann Sonata" follows strict sonata-allegro form.
-   **B.** Every sonata on the program is either Classical or Romantic. Most Classical sonatas follow strict sonata-allegro form. The "Hoffmann Sonata" is not Romantic. Therefore, the "Hoffmann Sonata" probably follows strict sonata-allegro form.
-   **C.** Every sonata on the program is either Classical or Romantic. If a sonata is Classical, it follows strict sonata-allegro form. The "Hoffmann Sonata" is Classical. Therefore, the "Hoffmann Sonata" follows strict sonata-allegro form.
-   **D.** If a sonata is Classical, it follows strict sonata-allegro form. The "Hoffmann Sonata" does not follow strict sonata-allegro form. Therefore, the "Hoffmann Sonata" is not Classical.
-   **E.** Every sonata on the program is either Classical or Romantic. If a sonata is Romantic, it does not follow strict sonata-allegro form. The "Hoffmann Sonata" follows strict sonata-allegro form. Therefore, the "Hoffmann Sonata" is Classical.

**Correct-answer rationale:** Stimulus: A∨B; A→C; x is ¬B; ∴ x is C. The ¬B premise forces x into the A disjunct by elimination, and A→C delivers the positive conclusion. (A) matches exactly: Classical∨Romantic; Classical→strict form; ¬Romantic; ∴ strict form.

---

### lr-0242 — LR parallel_flaw d1

**Stimulus:** If a plant receives sunlight, it will grow. The fern in my kitchen is growing. Therefore, it must be receiving sunlight.

**Stem:** The flawed reasoning in which one of the following is most similar to the flawed reasoning in the argument above?

-   **A.** If a student studies hard, she will pass the exam. Dana studied hard, so Dana passed the exam.
- ✓ **B.** If it snows, the schools close. The schools are closed today. Therefore, it must be snowing.
-   **C.** Most people who exercise feel healthier. Marcus exercises, so Marcus probably feels healthier.
-   **D.** All mammals have lungs. A whale is a mammal. Therefore, a whale has lungs.
-   **E.** The more you practice piano, the better you get. Elena practices every day, so she is improving.

**Correct-answer rationale:** Stimulus form: 'If P then Q; Q; therefore P' — affirming the consequent, a sufficient-necessary confusion. (B) runs the identical move: 'If snow then schools close; schools are closed; therefore snowing.'

---

### lr-0004 — LR assumption_necessary d1

**Stimulus:** Attorney: The statute prohibits any commercial use of the public fountain. My client used the fountain as the backdrop for a paid photography shoot. Therefore, my client violated the statute.

**Stem:** The attorney's argument requires the assumption that

- ✓ **A.** using the fountain as a backdrop for a paid photography shoot is a commercial use of the fountain
-   **B.** the statute has been enforced against other photographers in the past
-   **C.** the client was aware of the statute at the time of the photo shoot
-   **D.** no public official granted the client permission to use the fountain
-   **E.** the fountain is the only public landmark covered by the statute

**Correct-answer rationale:** The statute prohibits commercial use; the conclusion asserts a violation. Unless the photo shoot counts as commercial use, the premise cannot reach the conclusion. Negating A breaks the argument.

---

### lr-0002 — LR assumption_necessary d1

**Stimulus:** Ethicist: A promise made under duress is not morally binding. Thus, the contract Mara signed while being threatened by her employer imposes no moral obligation on her.

**Stem:** The ethicist's argument depends on assuming which one of the following?

-   **A.** Mara's employer will face legal consequences for threatening her.
- ✓ **B.** A contract signed under threatening conditions counts as a promise made under duress.
-   **C.** No contract is ever morally binding if one party benefits more than the other.
-   **D.** Mara intended to break the contract from the moment she signed it.
-   **E.** Contracts and promises differ in the legal obligations they create.

**Correct-answer rationale:** The premise speaks of promises under duress; the conclusion is about a contract signed under threat. Without the bridge that such a contract qualifies as a promise made under duress, the premise does not reach the conclusion.

---

### lr-0251 — LR parallel_flaw d2

**Stimulus:** Nutritionist: Anyone who eats a serving of oily fish each day will lower their risk of heart disease. Mira eats oily fish every day, and her cardiologist tells her that her risk of heart disease is low. It follows that lowering one's risk of heart disease requires daily consumption of oily fish, and that patients who do not eat oily fish must therefore be at elevated risk.

**Stem:** Which one of the following contains flawed reasoning most similar to that in the nutritionist's argument?

- ✓ **A.** Studying two hours a night is enough to pass the bar exam. Daniel studies two hours a night and passed the bar. So studying two hours a night is the only way to pass the bar, and anyone who studies less than that must fail.
-   **B.** Daily meditation reduces stress in those who practice it. Since Hugo reports reduced stress, he probably meditates daily.
-   **C.** Regular exercise lowers blood pressure. Regular exercise also improves sleep. So anyone whose blood pressure is low probably sleeps well.
-   **D.** Everyone who trains at high altitude builds endurance. Anika trained at high altitude, so Anika built endurance. Therefore, high-altitude training is widely available to athletes.
-   **E.** Reading aloud to children improves their vocabulary. Most parents who read aloud to their children are well educated. So well-educated parents produce children with the best vocabularies.

**Correct-answer rationale:** Stimulus: (i) flips sufficient (oily fish is enough to lower risk) into necessary (required), and (ii) generalizes from one person's case to all patients. (A) flips sufficient (two hours is enough to pass) into necessary (only way) and generalizes from Daniel's case to everyone who studies less.

---

### lr-0188 — LR must_be_true d1

**Stimulus:** The winning entry in this year's Veldt Short Fiction Prize was submitted either by a novelist who has previously published with Veldt or by a first-time contributor. Investigation has revealed that the winning entry was not submitted by any novelist who has previously published with Veldt.

**Stem:** Which one of the following must be true if the statements above are true?

-   **A.** The winning entry was submitted by an author whose work has never appeared in any journal.
- ✓ **B.** The winning entry was submitted by a first-time contributor to Veldt.
-   **C.** Most previous Veldt Prize winners were first-time contributors.
-   **D.** First-time contributors produce stronger short fiction than returning contributors do.
-   **E.** The judges preferred to award the prize to a newcomer this year.

**Correct-answer rationale:** Given the either/or premise and the denial of the first disjunct, the remaining disjunct holds: the winner was a first-time contributor.

---

### lr-0074 — LR flaw d2

**Stimulus:** Attorney: The prosecution has produced no document, no witness, and no recording that shows my client was present at the warehouse on the night in question. In the face of such a complete absence of evidence, the jury can only conclude that my client was in fact elsewhere that night.

**Stem:** The reasoning in the attorney's argument is flawed because it

-   **A.** attacks the prosecution's motives instead of the prosecution's evidence
- ✓ **B.** treats the absence of evidence for a claim as if it were evidence that the claim is false
-   **C.** treats evidence that a claim is false as if it were evidence that the claim is true
-   **D.** relies on a witness whose testimony has not been corroborated
-   **E.** presumes that any defendant lacking an alibi must be guilty

**Correct-answer rationale:** The attorney moves from 'no evidence presented that the client was there' to 'the client was elsewhere.' Absence of evidence isn't evidence of absence; it is compatible with the client having been there but leaving no trace.

---

### lr-0135 — LR method_of_reasoning d2

**Stimulus:** Law professor: It is sometimes said that judges should never rely on unpublished decisions. But a judge may rely on an unpublished decision either as binding precedent or merely as persuasive reasoning. When treated as binding, the decision controls outcomes other courts have never had a chance to scrutinize; when treated as persuasive, it is simply one more source of argument. So the blanket prohibition is unwarranted: only reliance of the first kind raises the concerns critics actually cite.

**Stem:** The law professor's argument proceeds by

- ✓ **A.** drawing a distinction between two uses of a practice and arguing that the objection to the practice applies only to one of them
-   **B.** showing that a proposed rule would produce an outcome the critics themselves would condemn
-   **C.** rejecting a rule on the ground that it has never been adopted in any jurisdiction
-   **D.** identifying an ambiguity in a legal term and concluding that the term should be abandoned
-   **E.** appealing to an analogy between legal practice and scientific experimentation

**Correct-answer rationale:** The professor separates 'binding' from 'persuasive' reliance, then argues the critics' worry applies only to the first, so a blanket ban is too broad. A captures both moves.

---

### lr-0156 — LR most_strongly_supported d1

**Stimulus:** In a controlled test, engineers measured the fuel consumption of a fleet of delivery trucks before and after installing software that automatically adjusts engine settings based on road grade and speed. Trucks using the software consumed, on average, 8 percent less fuel per kilometer than identical trucks without the software. Driving routes and cargo loads were held constant across both groups.

**Stem:** The statements above most strongly support which one of the following?

-   **A.** Installing the software reduces fuel consumption by the same amount for every truck that uses it.
-   **B.** Any technology that adjusts engine settings automatically will lower a truck's fuel consumption.
- ✓ **C.** Trucks equipped with the engine-adjustment software tend to consume less fuel per kilometer than otherwise comparable trucks without it.
-   **D.** The software reduces fuel consumption primarily by lowering engine speed on steep grades.
-   **E.** Fleet operators who adopt the software will recoup its purchase cost within a year.

**Correct-answer rationale:** Identical trucks on identical routes with identical loads differed only in whether they used the software, and the software-equipped trucks averaged 8 percent lower fuel use. The hedged comparative generalization tracks exactly what was measured.

---

### lr-0391 — LR role_in_argument d1

**Stimulus:** Regular aerobic exercise has been shown in numerous clinical studies to lower resting blood pressure in adults with mild hypertension. Therefore, physicians treating patients with mild hypertension should routinely recommend aerobic exercise as part of the treatment plan.

**Stem:** The claim that regular aerobic exercise has been shown in numerous clinical studies to lower resting blood pressure in adults with mild hypertension plays which one of the following roles in the argument?

-   **A.** It is the main conclusion of the argument.
- ✓ **B.** It is a premise offered in support of the argument's main conclusion.
-   **C.** It is a claim the argument is designed to discredit.
-   **D.** It is a generalization that the argument's conclusion is meant to explain.
-   **E.** It is background information unrelated to the argument's reasoning.

**Correct-answer rationale:** The explicit marker "therefore" introduces the recommendation to physicians as the conclusion. The claim about clinical studies is the evidence given for that recommendation, i.e., a supporting premise.

---

### lr-0276 — LR parallel_reasoning d1

**Stimulus:** If the wetland's water level drops below one meter, the resident herons will relocate to the river delta. The water level dropped below one meter last week. Therefore, the resident herons relocated to the river delta.

**Stem:** Which one of the following arguments is most similar in its reasoning to the argument above?

-   **A.** Every licensed electrician carries liability insurance. Marcus is a licensed electrician. Therefore, Marcus carries liability insurance.
-   **B.** If the wetland's pH rises above eight, the frog population declines. The frog population has not declined. Therefore, the pH has not risen above eight.
- ✓ **C.** If the train is on schedule, the 7:15 departure leaves from platform two. The train is on schedule today. Therefore, the 7:15 departure leaves from platform two.
-   **D.** Either the greenhouse vent is open or the temperature will exceed 90 degrees. The temperature did not exceed 90 degrees. Therefore, the vent was open.
-   **E.** If a meadow is grazed, wildflowers become more abundant. The meadow's wildflowers are more abundant, so the meadow has been grazed.

**Correct-answer rationale:** Stimulus: A -> B; A; therefore B. (C) matches: on-schedule -> platform two; on schedule; therefore platform two.

---

### lr-0211 — LR paradox_resolve d1

**Stimulus:** Last year, the town of Millbrook doubled the size of Riverside Park and added new playgrounds, picnic areas, and walking trails. Yet annual attendance at Riverside Park fell by nearly 30 percent compared with the previous year.

**Stem:** Which one of the following, if true, most helps to resolve the apparent paradox?

-   **A.** Riverside Park's budget for maintenance did not increase along with its size.
- ✓ **B.** A large new amusement park opened five miles from Millbrook last year, drawing many of Riverside Park's former visitors.
-   **C.** The walking trails at Riverside Park are longer than any others in the region.
-   **D.** Millbrook's population has been growing steadily for the past decade.
-   **E.** Attendance at Riverside Park had been rising each year for the five years before the expansion.

**Correct-answer rationale:** The expansion made the park more appealing, which should have raised attendance; the competing new amusement park siphoned visitors away. Both facts can be true at once once the alternative attraction is introduced.

---

### lr-0399 — LR role_in_argument d1

**Stimulus:** Historian: Every major city in the empire that survived the plague of 432 had a fortified harbor, while nearly every city without a fortified harbor was abandoned within a decade. So fortified harbors were a key factor in whether a city survived the plague years.

**Stem:** The claim that every major city in the empire that survived the plague of 432 had a fortified harbor, while nearly every city without a fortified harbor was abandoned within a decade plays which one of the following roles in the historian's argument?

-   **A.** It is the historian's main conclusion.
- ✓ **B.** It is a claim offered as evidence for the historian's main conclusion.
-   **C.** It is an opposing view the historian is arguing against.
-   **D.** It is a sub-conclusion derived from a claim about fortified harbors.
-   **E.** It is background information unrelated to the argument's reasoning.

**Correct-answer rationale:** The historian concludes, after "so," that fortified harbors were a key factor in survival. The pattern reported before "so" is the evidence — a supporting premise.

---

### lr-0378 — LR principle_justify d2

**Stimulus:** Policy analyst: The state's new rule requires anyone wishing to braid hair professionally to complete 1,500 hours of cosmetology training and pass a chemistry exam covering dyes the braiders never use. The rule is meant to protect consumers from unsanitary practices, but the same safety outcome could be achieved through a short sanitation course and a simple inspection regime. The state's rule is unjustified.

**Stem:** Which one of the following principles, if valid, most helps to justify the policy analyst's reasoning?

-   **A.** A government regulation is unjustified unless it is supported by a majority of the workers in the regulated trade.
- ✓ **B.** A government regulation that imposes significant burdens on those it regulates is unjustified when a substantially less burdensome alternative would achieve the same legitimate purpose.
-   **C.** Consumer-protection regulations should be tailored to the specific risks of each trade rather than modeled on unrelated trades.
-   **D.** Occupational licensing requirements for hair braiders must exclude material on chemical hair dyes.
-   **E.** Any regulation motivated by a legitimate safety interest is justified regardless of the costs it imposes on workers.

**Correct-answer rationale:** The analyst's verdict rests on (i) the rule's heavy burden on braiders and (ii) the availability of a much less burdensome alternative that achieves the same safety aim. Principle (B) joins those exact conditions to an unjustified verdict.

---

### lr-0235 — LR paradox_resolve d3

**Stimulus:** Five years ago, the state legislature overhauled its fraud statutes, narrowing the definition of criminal fraud to exclude certain deceptive but non-malicious business practices. Since the overhaul, arrests for fraud have fallen by 30 percent statewide. Prosecutors, however, now file formal charges in 85 percent of cases referred to them, up from 60 percent before the overhaul. Despite this higher charging rate, the absolute number of fraud convictions has fallen by nearly 20 percent.

**Stem:** Which one of the following, if true, most helps to resolve the apparent discrepancy?

- ✓ **A.** The statutory overhaul eliminated from fraud law a large class of minor, easily-proven offenses, so the cases that remain are fewer in number but more likely to survive a prosecutor's screen.
-   **B.** Defendants charged with fraud under the new statute are more likely to request jury trials than defendants charged under the old statute.
-   **C.** Prosecutors' offices received a budget increase in the year following the overhaul.
-   **D.** Many businesses responded to the overhaul by increasing their internal compliance audits.
-   **E.** The overhaul lengthened the average sentence for fraud convictions.

**Correct-answer rationale:** If the overhaul removed a large tier of low-grade offenses from fraud law, total arrests drop and the surviving cases are concentrated in serious, well-evidenced conduct — exactly the cases prosecutors readily charge, explaining the higher charging percentage. Convictions still fall in absolute terms because the pool of chargeable conduct shrank. All three statistics reconcile through the narrowed definition.

---

### lr-0253 — LR parallel_flaw d2

**Stimulus:** In Norway, as the share of electric vehicles on the road has risen, urban air quality has improved. It follows that electric vehicles cause cleaner air, and that worldwide adoption of electric vehicles is therefore the primary means by which humanity will solve global air pollution.

**Stem:** Which one of the following contains a pattern of flawed reasoning most similar to that in the argument above?

- ✓ **A.** In Japan, as broadband speeds have risen, small-business productivity has risen. So faster broadband causes higher productivity, and expanding broadband globally will be the chief driver of worldwide economic growth.
-   **B.** In Denmark, cycling rates have increased while obesity rates have fallen. So cycling probably causes weight loss.
-   **C.** In several European countries, reading scores have risen alongside increased library funding. Therefore, library funding must be the main cause of rising literacy in those particular countries.
-   **D.** Many nations have reduced smoking rates through taxation. Therefore, taxation of unhealthy products is the most effective public-health tool available to governments everywhere.
-   **E.** In Finland, school meal programs are associated with better student health. So Finland's particular meal program improves health, and its specific curriculum should be exported worldwide.

**Correct-answer rationale:** Stimulus: (i) treats a within-one-country correlation as causation, then (ii) inflates a local effect into the primary global solution. (A) replicates both: a Japan-internal correlation treated as causal, then inflated to the chief driver of worldwide economic growth.

---

### lr-0421 — LR strengthen d1

**Stimulus:** A hospital cafeteria switched from serving raw salad bar items to only cooked vegetables last March. In the three months that followed, reported cases of gastrointestinal illness among cafeteria regulars fell by nearly half compared with the same period the previous year. The cafeteria's dietitian concluded that eliminating the raw items was probably what caused the decline in illness.

**Stem:** Which one of the following, if true, most strengthens the dietitian's argument?

- ✓ **A.** Rates of seasonal gastrointestinal illness in the surrounding community were roughly the same in both years.
-   **B.** Several cafeteria regulars said they preferred the variety offered by the old salad bar.
-   **C.** The cafeteria's cooked vegetables are sourced from the same suppliers as the former raw items.
-   **D.** Hospitals that maintain salad bars report higher patient satisfaction with food service.
-   **E.** Gastrointestinal illness had been trending downward at the hospital for several years before the change.

**Correct-answer rationale:** The obvious alternative is that a milder flu season in the community, not the menu change, explains the drop. (A) rules that alternative out by showing community rates were unchanged, leaving the cafeteria's switch as the more plausible cause.

---

### lr-0358 — LR principle_conform d3

**Stimulus:** A university is justified in disciplining a student for disruptive speech at a campus event only if (a) the speech was made during a formally scheduled event at which attendance was open to the university community, (b) the speech prevented the scheduled speaker from being heard by the audience, and (c) the student had received a prior warning from a university official at the event, unless the student was a duly scheduled participant on the program whose allotted time had not yet concluded. Any disciplinary sanction imposed must be proportionate to the degree of disruption caused.

**Stem:** Which one of the following judgments most closely conforms to the principle above?

- ✓ **A.** At a scheduled lecture open to the university community, Ida shouted over the invited speaker until the speaker abandoned the podium. A dean at the event had warned Ida in writing thirty minutes earlier to desist. Ida was not on the program. The university issues a one-semester probation, a sanction described as matched to the total loss of the lecture.
-   **B.** At a scheduled public debate, Jari, the affirmative debater, spoke forcefully during his allotted fifteen minutes, overlapping occasionally with his opponent's reactions. The university expels Jari for disruption.
-   **C.** In a private dormitory common room, Kem argued loudly with a visiting speaker until the speaker left. No university warning was issued and the gathering was not a formally scheduled event. The university suspends Kem.
-   **D.** At a formally scheduled lecture, Lira heckled sporadically but the speaker continued and finished the lecture on schedule. Lira had been warned twice. The university expels Lira permanently.
-   **E.** At a formally scheduled lecture, Moir shouted over the speaker until the speaker abandoned the podium. No university official was present to warn Moir, but security escorted him out. The university issues a sanction matched to the degree of disruption.

**Correct-answer rationale:** Ida's case satisfies every antecedent condition: a formally scheduled event open to the community, speech that prevented the speaker from being heard, and a prior warning from a university official at the event. The exception does not trigger because Ida was not a scheduled participant. A one-semester probation proportionate to the loss of the lecture meets the proportionality clause.

---

### lr-0480 — LR weaken d2

**Stimulus:** Attorney: The state of Arlen enacted a law requiring all commercial truck drivers to install electronic logging devices that automatically record driving hours. Within two years, the rate of accidents involving Arlen commercial trucks had dropped by nearly a quarter. The state of Brennan has now enacted an identical logging-device requirement; Brennan should expect a similarly sharp reduction in its own rate of accidents involving commercial trucks.

**Stem:** Which one of the following, if true, most weakens the attorney's argument?

-   **A.** Arlen's commercial trucking fleet is, on average, slightly older than Brennan's.
-   **B.** The two states have comparable highway systems and similar weather conditions throughout the year.
- ✓ **C.** At the same time as it enacted the logging-device requirement, Arlen also tripled the number of state inspectors assigned to review commercial-truck records and hired a specialized prosecutorial unit to pursue hours-of-service violations; Brennan has taken no such enforcement steps.
-   **D.** The electronic logging devices used in Arlen were manufactured by several different companies, some of which sell their devices at a premium.
-   **E.** A few Arlen trucking firms complained that the logging devices were initially unreliable.

**Correct-answer rationale:** The attorney infers that Brennan will see a similar drop because it enacted the same law. (C) reveals that Arlen paired the law with a major enforcement expansion — tripled inspectors and a dedicated prosecutorial unit — that Brennan has not matched. The analogy collapses once the true cause is identified as the enforcement regime, not the law alone.

---

### lr-0081 — LR flaw d3

**Stimulus:** Epidemiologist: As someone who has spent thirty years analyzing outbreak data, I can assure the council that the new pathogen poses a graver threat than the old one. The old pathogen's incidence rose by just 4 percent last year, whereas the new pathogen's incidence rose by 60 percent. Anyone who has not worked in the field, as I have, should hesitate to dispute these numbers.

**Stem:** The reasoning in the epidemiologist's argument is most vulnerable to criticism on the grounds that it

- ✓ **A.** treats a comparison of rates of change as if it established a comparison of total case counts, while implying that the speaker's expertise insulates that inference from challenge
-   **B.** presumes, without providing justification, that no other pathogens pose a comparable threat to public health
-   **C.** infers a causal relationship between the speaker's expertise and the accuracy of the data cited
-   **D.** relies on statistics drawn from a sample that is too small to support a general conclusion
-   **E.** assumes that what is true of the new pathogen's incidence must also be true of its mortality rate

**Correct-answer rationale:** A percentage rise from a small base can still leave the new pathogen's total caseload far below the old one's; the argument slides from rate-of-change to absolute threat, and wards off objections by citing the speaker's experience rather than addressing the inference.

---

### lr-0180 — LR most_strongly_supported d3

**Stimulus:** A regional internet service provider implemented a policy in which residential connections whose monthly traffic exceeds a threshold are throttled to a lower speed until the next billing cycle. Network engineers have observed that during peak evening hours, outbound queues at the provider's core routers fill up more quickly than at any other time, even though total traffic during peak hours is only modestly greater than at late-morning hours. Average latency measured at customer endpoints rises sharply during peak evening hours, including for customers whose connections are not being throttled.

**Stem:** The statements above most strongly support which one of the following?

- ✓ **A.** At least some of the peak-hour latency experienced by the provider's customers is due to conditions at the provider's core routers rather than to the throttling policy alone.
-   **B.** The throttling policy is the primary cause of the elevated latency that customers experience during peak evening hours.
-   **C.** Eliminating the throttling policy would substantially reduce average peak-hour latency for the provider's customers.
-   **D.** Every customer whose monthly traffic exceeds the threshold experiences higher average latency than every customer whose traffic does not.
-   **E.** Expanding capacity at the core routers would eliminate peak-hour latency for all of the provider's customers.

**Correct-answer rationale:** Core-router outbound queues fill up fastest during peak evening hours despite only modestly higher traffic than late morning, and peak-hour latency rises sharply even for non-throttled customers. Together these support the hedged claim that at least some of the peak-hour latency comes from conditions at the core routers, not only from the throttling policy. 'At least some' and 'rather than...alone' fit the data.

---

### rc-0040 — RC comparative d3 specific_detail

**Stem:** Which one of the following features of oral histories is emphasized in passage B but does not appear in passage A?

-   **A.** The continuity of a history's transmission across generations
-   **B.** The consistency of a history's content across independent lines of transmission
-   **C.** The community's procedures for verifying a history's content
- ✓ **D.** The ceremonial setting in which a history is told and the entitlement of its teller
-   **E.** The susceptibility of a history to ordinary cross-examination

**Correct-answer rationale:** Passage B uniquely describes oral histories as embedded in a setting where 'the ceremonial setting in which it is told' and 'who is entitled to tell it' are constitutive of the history's authority. Passage A mentions none of this.

---

### rc-0100 — RC law d1 passage_structure

**Stem:** Which one of the following most accurately describes the organization of the passage?

- ✓ **A.** A doctrine is described, the common justifications for it are presented, objections are reported, and a qualified prescription is offered.
-   **B.** A historical controversy is surveyed and resolved in favor of one of two long-standing positions.
-   **C.** A judicial opinion is praised, its critics are rebutted, and the opinion is reaffirmed without qualification.
-   **D.** Several competing doctrines are set out, and their relative merits are ranked according to a single criterion.
-   **E.** A statutory scheme is described, and the author argues that Congress should amend it.

**Correct-answer rationale:** Paragraph 1 sets out the two-step doctrine; paragraph 2 gives the expertise and accountability justifications; paragraph 3 records objections; paragraph 4 offers the author's division-based prescription.

---

### rc-0037 — RC comparative d3 passage_structure

**Stem:** Which one of the following most accurately describes the relationship between the two passages?

- ✓ **A.** The passages reach the same conclusion about the shortfall in current Canadian practice, but passage A locates the shortfall in the weighing of admitted evidence while passage B locates it in the format through which the evidence is received.
-   **B.** Passage A argues that Canadian jurisprudence has fully realized its aims, and passage B argues that it has not.
-   **C.** Passage A defends the admission of oral histories, while passage B opposes their admission on procedural grounds.
-   **D.** Passage A proposes reforms that passage B argues would be counterproductive.
-   **E.** Passage A and passage B disagree about whether oral histories should be admitted as evidence at all.

**Correct-answer rationale:** Both agree the current state of play falls short. A's diagnosis: the shortfall is in weighting — oral sources are discounted against written ones. B's diagnosis: the shortfall is upstream, in how the testimony is formatted for legal consumption. Same verdict, different explanations.

---

### rc-0094 — RC law d1 passage_structure

**Stem:** Which one of the following most accurately describes the organization of the passage?

- ✓ **A.** A traditional rule is stated, a doctrine developed to soften it is introduced and explained, restrictions on that doctrine are surveyed, and one such restriction is endorsed.
-   **B.** Two rival legal doctrines are compared, and one is shown to be superior on historical grounds.
-   **C.** A judicial opinion is criticized in detail, and an alternative formulation of the doctrine is proposed.
-   **D.** An abstract principle is announced, illustrated with several hypothetical cases, and then reconciled with statutory requirements.
-   **E.** A legal controversy is described, the positions of each side are evaluated, and the author concludes that the question is not yet resolvable.

**Correct-answer rationale:** Paragraph 1 states the consideration rule; paragraph 2 introduces the estoppel doctrine via the 1932 New Hampshire opinion; paragraph 3 surveys the jurisdictional restrictions; paragraph 4 endorses the reliance-measured remedy.

---

### rc-0148 — RC natural_science d2 main_point

**Stem:** Which one of the following most accurately expresses the main point of the passage?

-   **A.** The Younger Dryas was caused by a shutdown of the Atlantic meridional overturning circulation, a conclusion now well supported by sediment-core evidence.
- ✓ **B.** Although two competing hypotheses have been advanced to explain the abrupt onset of the Younger Dryas, each faces unresolved difficulties, and the identity of the trigger remains an open question.
-   **C.** Because orbital forcing cannot account for the speed of the Younger Dryas, paleoclimatologists have been forced to abandon their earlier confidence in slow-acting climatic mechanisms.
-   **D.** Recent discoveries of microspherules and platinum anomalies at the Younger Dryas boundary have displaced the meltwater hypothesis as the leading explanation of the event.
-   **E.** Higher-resolution chronologies of the Younger Dryas boundary are needed if paleoclimatologists are to confirm that an extraterrestrial impact initiated the cooling.

**Correct-answer rationale:** The passage introduces the puzzle, presents two hypotheses with their supporting evidence, catalogues the difficulties each faces, and closes by stating that the trigger remains an open question. B captures all three strands.

---

### rc-0139 — RC natural_science d1 function

**Stem:** The author's mention of the 1959 Soviet photograph of the far side of the Moon functions in the passage primarily to

- ✓ **A.** illustrate what it means for a body to keep the same face turned toward its primary.
-   **B.** establish that scientific understanding of tidal locking dates only to the late 1950s.
-   **C.** provide historical evidence that contradicts an earlier theory of the Moon's rotation.
-   **D.** contrast human observation of the Moon with observation of exoplanets.
-   **E.** explain why tidal locking is a faster process than had previously been assumed.

**Correct-answer rationale:** The reference comes immediately after the sentence describing how a locked body keeps the same face toward its primary; the photograph is offered to make that abstract definition concrete.

---

### rc-0071 — RC humanities d2 main_point

**Stem:** Which one of the following most accurately expresses the main point of the passage?

-   **A.** Bebop was an entirely unprecedented musical idiom whose harmonic vocabulary bore no meaningful relation to that of the swing era it replaced.
- ✓ **B.** While bebop differed from swing in important ways, its harmonic and rhythmic innovations were extensions of devices already developed within the big bands, and the revolt narrative obscures this continuity.
-   **C.** Charlie Parker and Dizzy Gillespie deserve more credit than they have traditionally received for their early apprenticeships in territory and touring dance bands.
-   **D.** The rhythmic contributions of drummers such as Jo Jones have been undervalued by historians who treat bebop's rhythmic innovations as the work of its soloists.
-   **E.** The after-hours club provided a social setting for musical experimentation that the commercial ballroom could not have supported.

**Correct-answer rationale:** Paragraph 2 opens the corrective ('flattens a more interesting continuity'), paragraph 3 concedes bebop's distinctiveness and then reasserts the continuity thesis and its implication for understanding swing. B captures both the concession and the main thesis.

---

### rc-0217 — RC social_sciences d3 specific_detail

**Stem:** According to the passage, Abbott's account differs from Larson's in which one of the following ways?

-   **A.** Abbott denies that credentialing plays any role in professionalization, whereas Larson treats credentialing as central.
- ✓ **B.** Abbott treats credentialing as a consequence of a prior jurisdictional contest, whereas Larson treats it as the mechanism producing the profession's market position.
-   **C.** Abbott focuses on the cultural authority of numerical facts, whereas Larson focuses on rents.
-   **D.** Abbott restricts his account to twentieth-century occupations, whereas Larson addresses the nineteenth century.
-   **E.** Abbott rejects the evidentiary record on which Larson relies.

**Correct-answer rationale:** Paragraph 2 states that, on Abbott's view, 'Credentialing ... follows jurisdictional success rather than producing it,' while Larson is described in paragraph 1 as holding that binding a credential to a legally protected title is what produces the rents. B captures the ordering contrast exactly.

---

### rc-0213 — RC social_sciences d3 inference

**Stem:** The passage most strongly suggests that the author would agree with which one of the following statements?

- ✓ **A.** Any sociological account of professionalization that fails to explain commercial failure as well as success is at that point inadequate.
-   **B.** Jurisdictional competition is a sufficient condition for an occupation to achieve professional status.
-   **C.** Cultural authority plays no role in the success of professional institutes.
-   **D.** Market-closure mechanisms are irrelevant to the study of modern professions.
-   **E.** MacDonald's thesis should be accepted whenever Larson's thesis fails to fit the evidence.

**Correct-answer rationale:** The author's specific complaint against Larson is that the market-closure thesis 'struggles to account for' institutes that 'achieved legal credentials but failed commercially,' and explicitly credits Abbott for 'absorbing this anomaly.' The general principle underwriting that complaint is A — explaining both success and failure matters. The inference is hedged appropriately.

---

### rc-0136 — RC natural_science d1 specific_detail

**Stem:** According to the passage, the rotational braking torque responsible for tidal locking disappears when

-   **A.** the deforming body has become perfectly rigid and can no longer form bulges.
-   **B.** the two bodies have drifted far enough apart that their mutual gravitational pull is negligible.
- ✓ **C.** the deforming body's spin rate has fallen into step with its orbital period, so that its bulges lie on the line connecting the two centers.
-   **D.** the orbital period of the pair has become long enough that the bulges can no longer be carried ahead of the connecting line.
-   **E.** the central body has itself begun to rotate at the same rate as its companion.

**Correct-answer rationale:** Paragraph 2 states that as the spin rate falls to match the orbital period, 'the bulges sit on the line between the two centers and the braking torque disappears.'

---

### lg-0048 — LG basic_linear d1 must_be_true

**Stem:** If Huang speaks on Thursday, then which one of the following must be true?

- ✓ **A.** Ibanez speaks on Friday.
-   **B.** Gupta speaks on Tuesday.
-   **C.** Jain speaks on Wednesday.
-   **D.** Ibanez speaks on Wednesday.
-   **E.** Gupta speaks on Thursday.

**Correct-answer rationale:** Huang on Thursday forces Ibanez into Friday, since Ibanez must come after Huang and no later day is available. Gupta and Jain then take Tuesday and Wednesday (in either order) to satisfy their adjacency.

---

### lg-0165 — LG hybrid d2 cannot_be_true

**Stem:** If Hazelnut is baked as Bread-batch-1, then which one of the following CANNOT be true?

- ✓ **A.** Iced is baked on the Bread line.
-   **B.** Fougasse is baked as Bread-batch-2.
-   **C.** Kouign is baked as Bread-batch-3.
-   **D.** Ganache is baked as Pastry-batch-3.
-   **E.** Jam is baked as Pastry-batch-2.

**Correct-answer rationale:** If Hazelnut occupies Bread-batch-1, then the remaining two Bread slots must be filled by Fougasse and Kouign (in that order). Iced must therefore be on the Pastry line in every surviving world.

---

### lg-0029 — LG advanced_linear d2 could_be_true

**Stem:** Which one of the following could be true?

-   **A.** The Keele delivery is at stop 2.
-   **B.** The Harlan delivery is at stop 6.
- ✓ **C.** The Juno delivery is in the afternoon.
-   **D.** The Marsh delivery is at stop 2.
-   **E.** The Ives delivery is at stop 1.

**Correct-answer rationale:** Juno is in the afternoon in 3 of the 25 verified worlds (those where Harlan is also in the afternoon, since Harlan and Juno share a half-of-day).

---

### lg-0102 — LG grouping d1 must_be_true

**Stem:** If Qiu is placed in the Lab section, then which one of the following must be true?

- ✓ **A.** Reyes is placed in the Seminar section.
-   **B.** Sousa is placed in the Lab section.
-   **C.** Tran is placed in the Lab section.
-   **D.** Udo is placed in the Lab section.
-   **E.** Sousa is placed in the Seminar section.

**Correct-answer rationale:** Qiu and Reyes must be placed in different sections. If Qiu is in Lab, Reyes is in Seminar.

---

### lg-0050 — LG basic_linear d1 cannot_be_true

**Stem:** Which one of the following CANNOT be true?

- ✓ **A.** Ibanez speaks on Tuesday.
-   **B.** Gupta speaks on Wednesday.
-   **C.** Huang speaks on Tuesday.
-   **D.** Jain speaks on Thursday.
-   **E.** Ibanez speaks on Friday.

**Correct-answer rationale:** Farrell is on Monday, so Huang (who must come before Ibanez) would have to be on Monday to put Ibanez on Tuesday — but Monday is already taken. No valid schedule has Ibanez on Tuesday.

---

### lg-0161 — LG hybrid d2 orientation_question

**Stem:** Which one of the following could be the order in which the items are baked across the Bread line (batches 1 through 3) and the Pastry line (batches 1 through 3), respectively?

- ✓ **A.** Fougasse, Hazelnut, Kouign, Jam, Ganache, Iced
-   **B.** Fougasse, Hazelnut, Kouign, Ganache, Jam, Iced
-   **C.** Kouign, Hazelnut, Fougasse, Jam, Ganache, Iced
-   **D.** Fougasse, Jam, Kouign, Hazelnut, Ganache, Iced
-   **E.** Ganache, Hazelnut, Kouign, Jam, Fougasse, Iced

**Correct-answer rationale:** Fougasse=Bread-batch-1, Hazelnut=Bread-batch-2, Kouign=Bread-batch-3 (Fougasse before Kouign, both on Bread); Jam=Pastry-batch-1, Ganache=Pastry-batch-2 (Jam before Ganache, both on Pastry); Iced=Pastry-batch-3. Iced is not at Bread-batch-2, so the conditional is vacuously satisfied.

---

### lg-0107 — LG grouping d2 must_be_true

**Stem:** If Ames is assigned to the Maple crew, then which one of the following must be true?

-   **A.** Barr is assigned to the Maple crew.
-   **B.** Cho is assigned to the Harbor crew.
-   **C.** Ek is assigned to the Maple crew.
- ✓ **D.** Flores is assigned to the Harbor crew.
-   **E.** Doyle is assigned to the Harbor crew.

**Correct-answer rationale:** If Ames is in Maple, Doyle must also be in Maple. Since Maple already has Ames and Doyle, Cho must take the third Maple slot (Barr and Cho are in different crews and only one Harbor slot remains after Barr fills one of Barr/Cho). Working it out: Maple contains Ames, Doyle, and Cho; Harbor must therefore contain Barr, Ek, and Flores. So Flores is in Harbor.

---

### lg-0055 — LG basic_linear d1 cannot_be_true

**Stem:** Which one of the following CANNOT be true?

- ✓ **A.** Drums is the first exhibit visited.
-   **B.** Helmets is the second exhibit visited.
-   **C.** Coins is the fifth exhibit visited.
-   **D.** Fossils is the sixth exhibit visited.
-   **E.** Etchings is the second exhibit visited.

**Correct-answer rationale:** Coins must precede drums. If drums were first, no position would remain before it for coins. So drums cannot be first.

---
