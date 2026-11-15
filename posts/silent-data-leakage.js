(function () {
  var r = String.raw;
  (window.POSTS = window.POSTS || []).push({
    id: "silent-data-leakage",
    title: "Silent Failures: Where Data Leakage Actually Hides in Machine Learning",
    date: "16 November 2026",
    tags: ["Beginner Guide", "Evaluation", "Pipelines"],
    summary:
      "When regular code has a bug, it crashes with an error. When machine learning code has a bug, it outputs 99% accuracy on your screen and fails completely in the real world.",
    body: [
      { h: "The Practice Exam with the Answers Attached" },
      "Imagine studying for a tough exam. You sit down to take a practice test, but the answer key is accidentally printed on the back of the page. You peek at the answers while working through the questions and get a perfect 100%.",
      "You feel like a genius. But on the real exam day, there is no answer key, and you fail.",
      "This is exactly what happens with data leakage in machine learning. In normal software, bugs crash your computer with an error message. In machine learning, bugs do something much more dangerous: they make your model look brilliant on your computer, but completely useless when deployed to real users.",
      "Here are the five most common places students and beginners accidentally leak test data into their models, and how to fix each one with simple code.",

      { h: "1. The Preprocessing Trap: Scaling Before Splitting" },
      r`Before feeding numbers into an algorithm, we usually normalize them so that features with large numbers (like salary) don't overpower small numbers (like age). A standard way is Z-score scaling:`,
      {
        eq: r`\tilde{x}_i = \frac{x_i - \mu}{\sigma}`
      },
      r`Here, $x_i$ is a single data value, $\mu$ is the average (mean) of all values, and $\sigma$ is how spread out the values are (standard deviation).`,
      r`The mistake happens when you call scaler.fit() on the entire dataset *before* you split it into training and testing sets:`,
      {
        eq: r`\mu_{\text{all}} = \frac{1}{N_{\text{train}} + N_{\text{test}}} \left( \sum_{i \in \text{train}} x_i + \sum_{j \in \text{test}} x_j \right)`
      },
      "Notice that the test numbers are used to calculate the average. Your training data now has a sneak preview of the test data's distribution. The model has already peeked at the exam questions.",
      {
        code: `# ❌ WRONG: Calculating the average over ALL data before splitting
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X) # Computes mean and std using test rows!
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)


# ✅ RIGHT: Split first, then learn the average ONLY from the training set
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train) # Learns mean & std from train only
X_test = scaler.transform(X_test)       # Uses train mean & std to scale test`
      },
      "Rule of thumb: Never call .fit() or .fit_transform() on your test set. Your model must only learn from the training split.",
      {
        diagram: {
          figure: "1.1",
          label: "Data Flow Pipeline",
          svg: `<svg viewBox="0 0 740 280" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <marker id="arrow-leaky" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#E06C75" />
    </marker>
    <marker id="arrow-clean" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#98C379" />
    </marker>
    <marker id="arrow-neutral" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#6B7280" />
    </marker>
  </defs>

  <!-- Divider between scenarios -->
  <line x1="20" y1="135" x2="720" y2="135" stroke="#252530" stroke-width="1" stroke-dasharray="4 4" />

  <!-- SCENARIO 1: LEAKY -->
  <g transform="translate(20, 15)">
    <rect x="0" y="0" width="18" height="18" rx="4" fill="#3A1C20" />
    <text x="5" y="13" font-size="12" fill="#E06C75" font-weight="bold">✕</text>
    <text x="26" y="14" font-size="12" font-weight="600" fill="#E06C75" letter-spacing="0.05em">LEAKY: SCALING BEFORE SPLITTING</text>

    <!-- Node 1: Raw Data -->
    <rect x="0" y="30" width="130" height="58" rx="6" fill="#13141C" stroke="#2D313D" stroke-width="1" />
    <text x="65" y="55" font-size="12" font-weight="600" fill="#E2E8F0" text-anchor="middle">All Raw Data</text>
    <text x="65" y="73" font-size="10.5" fill="#8E95A5" text-anchor="middle">100% of rows</text>

    <!-- Arrow 1 -->
    <line x1="130" y1="59" x2="185" y2="59" stroke="#E06C75" stroke-width="1.5" marker-end="url(#arrow-leaky)" />
    <text x="158" y="50" font-size="9.5" fill="#E06C75" text-anchor="middle" font-family="monospace">fit_transform()</text>

    <!-- Node 2: Contaminated Scaler -->
    <rect x="190" y="30" width="160" height="58" rx="6" fill="#241418" stroke="#E06C75" stroke-width="1" />
    <text x="270" y="53" font-size="11.5" font-weight="600" fill="#F87171" text-anchor="middle">StandardScaler()</text>
    <text x="270" y="71" font-size="10" fill="#E06C75" text-anchor="middle">Uses Test Mean &amp; Std!</text>

    <!-- Arrow 2 -->
    <line x1="350" y1="59" x2="405" y2="59" stroke="#E06C75" stroke-width="1.5" marker-end="url(#arrow-leaky)" />
    <text x="378" y="50" font-size="9.5" fill="#E06C75" text-anchor="middle" font-family="monospace">split()</text>

    <!-- Node 3: Polluted Splits -->
    <rect x="410" y="30" width="145" height="58" rx="6" fill="#13141C" stroke="#E06C75" stroke-width="1" stroke-dasharray="3 3" />
    <text x="482" y="53" font-size="11.5" font-weight="600" fill="#E2E8F0" text-anchor="middle">Train (80%) + Test (20%)</text>
    <text x="482" y="71" font-size="10" fill="#F87171" text-anchor="middle">Already contaminated</text>

    <!-- Outcome Tag -->
    <rect x="580" y="35" width="125" height="48" rx="6" fill="#261014" stroke="#E06C75" stroke-width="1" />
    <text x="642" y="55" font-size="11" font-weight="bold" fill="#F87171" text-anchor="middle">False 99% Score</text>
    <text x="642" y="71" font-size="9.5" fill="#E06C75" text-anchor="middle">Fails on new data</text>
  </g>

  <!-- SCENARIO 2: CLEAN -->
  <g transform="translate(20, 155)">
    <rect x="0" y="0" width="18" height="18" rx="4" fill="#15291E" />
    <text x="5" y="13" font-size="12" fill="#98C379" font-weight="bold">✓</text>
    <text x="26" y="14" font-size="12" font-weight="600" fill="#98C379" letter-spacing="0.05em">CLEAN: SPLIT FIRST, SCALE TRAIN ONLY</text>

    <!-- Node 1: Raw Data -->
    <rect x="0" y="30" width="130" height="74" rx="6" fill="#13141C" stroke="#2D313D" stroke-width="1" />
    <text x="65" y="60" font-size="12" font-weight="600" fill="#E2E8F0" text-anchor="middle">All Raw Data</text>
    <text x="65" y="78" font-size="10.5" fill="#8E95A5" text-anchor="middle">100% of rows</text>

    <!-- Split Arrows -->
    <path d="M 130 55 L 160 55 L 185 45" fill="none" stroke="#61AFEF" stroke-width="1.5" marker-end="url(#arrow-neutral)" />
    <path d="M 130 75 L 160 75 L 185 88" fill="none" stroke="#61AFEF" stroke-width="1.5" marker-end="url(#arrow-neutral)" />
    <text x="156" y="44" font-size="9" fill="#61AFEF" text-anchor="middle">80%</text>
    <text x="156" y="99" font-size="9" fill="#61AFEF" text-anchor="middle">20%</text>

    <!-- Node 2A: Train Split -->
    <rect x="190" y="24" width="160" height="38" rx="6" fill="#152332" stroke="#61AFEF" stroke-width="1" />
    <text x="270" y="47" font-size="11.5" font-weight="600" fill="#93C5FD" text-anchor="middle">Train Split (80%)</text>

    <!-- Node 2B: Test Split (Locked) -->
    <rect x="190" y="70" width="160" height="38" rx="6" fill="#181924" stroke="#4B5563" stroke-width="1" />
    <text x="270" y="93" font-size="11" fill="#9CA3AF" text-anchor="middle">Test Split (Locked/Unseen)</text>

    <!-- Arrow from Train to Scaler -->
    <line x1="350" y1="43" x2="405" y2="43" stroke="#98C379" stroke-width="1.5" marker-end="url(#arrow-clean)" />
    <text x="378" y="35" font-size="9.5" fill="#98C379" text-anchor="middle" font-family="monospace">fit()</text>

    <!-- Node 3A: Clean Scaler -->
    <rect x="410" y="24" width="145" height="38" rx="6" fill="#14261B" stroke="#98C379" stroke-width="1" />
    <text x="482" y="42" font-size="11" font-weight="600" fill="#86EFAC" text-anchor="middle">Scaler (Train Only)</text>
    <text x="482" y="55" font-size="9.5" fill="#98C379" text-anchor="middle">Mean &amp; Std of Train</text>

    <!-- Transform to Test -->
    <path d="M 482 62 L 482 89 L 405 89" fill="none" stroke="#98C379" stroke-width="1.5" stroke-dasharray="3 3" />
    <line x1="350" y1="89" x2="405" y2="89" stroke="#98C379" stroke-width="1.5" marker-end="url(#arrow-clean)" />
    <text x="378" y="82" font-size="9.5" fill="#98C379" text-anchor="middle" font-family="monospace">transform()</text>

    <!-- Outcome Tag -->
    <rect x="580" y="43" width="125" height="48" rx="6" fill="#122518" stroke="#98C379" stroke-width="1" />
    <text x="642" y="63" font-size="11" font-weight="bold" fill="#86EFAC" text-anchor="middle">Honest Evaluation</text>
    <text x="642" y="79" font-size="9.5" fill="#98C379" text-anchor="middle">Zero Leakage</text>
  </g>
</svg>`,
          caption: "<strong>Figure 1.1:</strong> Scaling before splitting allows test statistics to pollute training data. Splitting first isolates the test set completely."
        }
      },

      { h: "2. The Identical Twin Bug: Augmentation Before Splitting" },
      "Data augmentation is a great technique where you flip, crop, or rotate images to give your model more variety to learn from.",
      "The mistake beginners make is taking a folder of 1,000 images, generating 5 rotated versions of each to make 5,000 images, and *then* calling train_test_split.",
      "What happens? An original photo of a dog ends up in the training set, and a slightly rotated copy of the exact same dog ends up in the test set.",
      "The model does not learn what a dog looks like. Instead, it memorizes the specific pattern on the living room rug behind the dog. When you test it, it gets 99% accuracy because it recognizes the rug it saw in training.",
      {
        code: `# ❌ WRONG: Augmenting before splitting
all_augmented_images = augment(raw_images) # 1,000 becomes 5,000
train_images, test_images = train_test_split(all_augmented_images, test_size=0.2)
# Result: Rotated twins are in both train and test!


# ✅ RIGHT: Split raw files first, augment ONLY the training split
train_raw, test_raw = train_test_split(raw_images, test_size=0.2)

train_images = augment(train_raw) # Augment training set to 4,000
test_images = test_raw            # Keep test set 100% untouched and raw`
      },

      { h: "3. Time-Series Shuffling: Reading Tomorrow's Newspaper" },
      r`When data depends on time (like stock prices, weather, or sensor readings), yesterday's number is strongly connected to today's number. In math terms, they have high autocorrelation:`,
      {
        eq: r`\text{Cov}(X_t, X_{t+1}) > 0`
      },
      "If you randomly shuffle time-series data, step t (say 2:00 PM) might land in your test set, while step t-1 (1:59 PM) and step t+1 (2:01 PM) land in your training set.",
      "The model is not learning to predict the future. It is simply looking at what happened before and after 2:00 PM and filling in the middle. It is like predicting yesterday's sports score using tomorrow's newspaper.",
      {
        code: `from sklearn.model_selection import TimeSeriesSplit

# ❌ WRONG: Random shuffling destroys the timeline
X_train, X_test, y_train, y_test = train_test_split(X, y, shuffle=True)


# ✅ RIGHT: Forward-chaining (the test set is always strictly in the future)
tscv = TimeSeriesSplit(n_splits=5)
for train_index, test_index in tscv.split(X):
    X_train, X_test = X[train_index], X[test_index]
    y_train, y_test = y[train_index], y[test_index]
    # Guaranteed: Training dates always come BEFORE test dates`
      },
      {
        diagram: {
          figure: "1.2",
          label: "Temporal Horizon",
          svg: `<svg viewBox="0 0 740 230" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <marker id="arrow-ts-leak" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#E06C75" />
    </marker>
    <marker id="arrow-ts-clean" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#98C379" />
    </marker>
  </defs>

  <!-- Divider -->
  <line x1="20" y1="115" x2="720" y2="115" stroke="#252530" stroke-width="1" stroke-dasharray="4 4" />

  <!-- SCENARIO 1: LEAKY RANDOM SHUFFLE -->
  <g transform="translate(20, 15)">
    <rect x="0" y="0" width="18" height="18" rx="4" fill="#3A1C20" />
    <text x="5" y="13" font-size="12" fill="#E06C75" font-weight="bold">✕</text>
    <text x="26" y="14" font-size="12" font-weight="600" fill="#E06C75" letter-spacing="0.05em">LEAKY: RANDOM SHUFFLING (AUTOCORRELATION LEAKAGE)</text>

    <!-- Timeline Labels -->
    <text x="0" y="42" font-size="10.5" fill="#8E95A5" font-family="monospace">Day 1 (Past)</text>
    <text x="560" y="42" font-size="10.5" fill="#8E95A5" font-family="monospace" text-anchor="end">Day 30 (Future)</text>

    <!-- Shuffled segments -->
    <g transform="translate(0, 48)">
      <rect x="0" y="0" width="560" height="26" rx="4" fill="#13141C" stroke="#2D313D" stroke-width="1" />

      <rect x="2" y="2" width="110" height="22" rx="3" fill="#152332" />
      <text x="57" y="17" font-size="10" fill="#93C5FD" text-anchor="middle" font-weight="500">Train</text>

      <rect x="114" y="2" width="70" height="22" rx="3" fill="#3D181C" />
      <text x="149" y="17" font-size="10" fill="#F87171" text-anchor="middle" font-weight="bold">Test</text>

      <rect x="186" y="2" width="150" height="22" rx="3" fill="#152332" />
      <text x="261" y="17" font-size="10" fill="#93C5FD" text-anchor="middle" font-weight="500">Train</text>

      <rect x="338" y="2" width="65" height="22" rx="3" fill="#3D181C" />
      <text x="370" y="17" font-size="10" fill="#F87171" text-anchor="middle" font-weight="bold">Test</text>

      <rect x="405" y="2" width="153" height="22" rx="3" fill="#152332" />
      <text x="481" y="17" font-size="10" fill="#93C5FD" text-anchor="middle" font-weight="500">Train (Day 25+)</text>
    </g>

    <!-- Backward Leakage Curve -->
    <path d="M 480 46 C 480 22, 150 22, 150 44" fill="none" stroke="#E06C75" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrow-ts-leak)" />
    <text x="315" y="22" font-size="9.5" fill="#F87171" text-anchor="middle" font-weight="600">Model uses Day 25 to predict Day 8!</text>

    <!-- Badge -->
    <rect x="580" y="32" width="120" height="42" rx="6" fill="#261014" stroke="#E06C75" stroke-width="1" />
    <text x="640" y="49" font-size="10.5" font-weight="bold" fill="#F87171" text-anchor="middle">Broken Reality</text>
    <text x="640" y="64" font-size="9" fill="#E06C75" text-anchor="middle">Impossible in Prod</text>
  </g>

  <!-- SCENARIO 2: CLEAN TEMPORAL SPLIT -->
  <g transform="translate(20, 130)">
    <rect x="0" y="0" width="18" height="18" rx="4" fill="#15291E" />
    <text x="5" y="13" font-size="12" fill="#98C379" font-weight="bold">✓</text>
    <text x="26" y="14" font-size="12" font-weight="600" fill="#98C379" letter-spacing="0.05em">CLEAN: FORWARD-CHAINING SPLIT (TIMESERIESSPLIT)</text>

    <!-- Timeline Labels -->
    <text x="0" y="42" font-size="10.5" fill="#8E95A5" font-family="monospace">Day 1 (Past)</text>
    <text x="560" y="42" font-size="10.5" fill="#8E95A5" font-family="monospace" text-anchor="end">Day 30 (Future)</text>

    <!-- Ordered segments -->
    <g transform="translate(0, 48)">
      <rect x="0" y="0" width="370" height="28" rx="4" fill="#152332" stroke="#61AFEF" stroke-width="1" />
      <text x="185" y="18" font-size="11" fill="#93C5FD" text-anchor="middle" font-weight="600">Training Set (Days 1 to 20: Strictly Past)</text>

      <!-- Cutoff line -->
      <line x1="375" y1="-5" x2="375" y2="33" stroke="#E5C07B" stroke-width="2" stroke-dasharray="3 3" />

      <rect x="380" y="0" width="180" height="28" rx="4" fill="#14261B" stroke="#98C379" stroke-width="1" />
      <text x="470" y="18" font-size="11" fill="#86EFAC" text-anchor="middle" font-weight="600">Test Set (Days 21 to 30)</text>
    </g>

    <!-- Arrow of Time indicator -->
    <path d="M 185 83 L 465 83" fill="none" stroke="#98C379" stroke-width="1.5" marker-end="url(#arrow-ts-clean)" />
    <text x="325" y="94" font-size="9.5" fill="#86EFAC" text-anchor="middle" font-family="monospace">Strict temporal direction (Past → Future)</text>

    <!-- Badge -->
    <rect x="580" y="38" width="120" height="42" rx="6" fill="#122518" stroke="#98C379" stroke-width="1" />
    <text x="640" y="55" font-size="10.5" font-weight="bold" fill="#86EFAC" text-anchor="middle">Zero Lookahead</text>
    <text x="640" y="70" font-size="9" fill="#98C379" text-anchor="middle">True Forecasting</text>
  </g>
</svg>`,
          caption: "<strong>Figure 1.2:</strong> Shuffling temporal data lets future events leak into past predictions. Forward-chaining guarantees strict chronological ordering."
        }
      },

      { h: "4. Group / Identity Leakage: The Hospital Room Problem" },
      "Imagine you want to build an AI to detect skin tumors from photos. You collect 1,000 photos from 100 hospital patients (10 photos per patient from different angles).",
      "If you split the photos randomly, photos from Patient #42 will be in both the training set and the test set.",
      "The computer does not learn the tumor shape. Instead, it notices Patient #42's skin freckles, specific lighting, or the hospital wall color in the background. It easily identifies Patient #42 in the test set and scores 98% accuracy.",
      "When tested in a new clinic with new patients and different walls, accuracy plummets to 50% (random guess).",
      {
        code: `from sklearn.model_selection import GroupKFold

# ✅ RIGHT: Keep all photos from the same patient together in ONE group
gkf = GroupKFold(n_splits=5)

# patient_ids tells sklearn: "Never split photos of the same patient across folds"
for train_idx, test_idx in gkf.split(X, y, groups=patient_ids):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]`
      },

      { h: "5. Overfitting the Validation Set: The Lucky Coin Trap" },
      "If you flip a coin 1,000 times, you will eventually get 10 heads in a row just by pure luck.",
      "In machine learning, students often take a validation set and test Model A. It gets 82%. They tweak the learning rate, change dropout, add a layer, and test again. After 300 attempts, one random configuration scores 92%!",
      "Did the model actually get smarter? Usually no. By testing 300 different setups against the exact same test questions, you simply found the model that got lucky on that specific slice of data.",
      "The golden solution is a three-way split: Train, Validation, and Test. Use the Validation set for your daily experiments, but lock the Test set in a vault. Only evaluate on the Test set once, at the very end of your project.",

      { h: "Summary of Common Leakage Traps" },
      {
        tbl: [
          ["Problem", "What Goes Wrong", "The Simple Fix"],
          ["Scaling / Normalizing", "Calculating average or median on whole dataset", "Call fit() only on training data"],
          ["Data Augmentation", "Rotating or cropping images before splitting", "Split raw files first; augment train only"],
          ["Time-Series Data", "Randomly shuffling sequential rows", "Use TimeSeriesSplit (past trains on future)"],
          ["Patient / User Groups", "Same person appears in both train and test", "Use GroupKFold on the person's ID"],
          ["Over-testing Validation", "Trying 200 model tweaks on one validation test", "Keep a final Test set locked until the end"]
        ]
      },

      { h: "Quick Checklist Before You Submit Any ML Project" },
      r`1. Did you split your data BEFORE calling any scaler, imputer, or tokenizer?`,
      r`2. Did you augment only the training partition, leaving the test partition clean?`,
      r`3. If your data has dates or timestamps, are your test dates strictly after your training dates?`,
      r`4. If multiple rows belong to the same person, device, or patient, are they grouped together?`,
      r`5. Did you evaluate your final chosen model on an untouched test set exactly once?`
    ]
  });
})();
