(function () {
  var r = String.raw;
  (window.POSTS = window.POSTS || []).push({
    id: "center-of-gravity",
    title: "The Center of Gravity method: an optimizer with no learning rate",
    date: "13 November 2026",
    tags: ["Optimizers", "Convex optimization"],
    summary:
      "Binary search in n dimensions: how cutting through the centroid shrinks the search region, why it is safe, and how fast it converges.",
    body: [
      { h: "The problem: finding the lowest point" },
      r`We have a bowl-shaped (convex) function $f$ and an allowed region $X$, and we want the lowest value of $f$ inside $X$.`,
      { eq: r`\min_{x \in X} f(x)` },
      r`Convex means there are no fake valleys, so any local minimum is the global minimum. We are only allowed one kind of question: at a point $x$, what are $f(x)$ and the slope $g$? One fact about slopes helps us later: the tangent line never goes above the curve.`,
      { eq: r`f(y) \ge f(x) + g \cdot (y - x) \quad \text{for every } y` },
      r`The goal is to get within $\varepsilon$ of the lowest value using as few questions as possible.`,

      { h: "Why not just use gradient descent?" },
      r`Gradient descent moves one point downhill, $x \leftarrow x - \eta\, g$, and SGD, AdaGrad and RMSProp are all versions of this. You must tune the learning rate $\eta$: too big and it jumps around, too small and it crawls. Each slope is used for one small step and then forgotten.`,
      "That wastes information. A slope at x tells us that the whole uphill side is worse than x, which is a big region we could cross out for good. Gradient descent never crosses anything out. So the question is: can we cross out a big chunk of the search space every round, with no learning rate?",

      { h: "The idea: a shrinking search region" },
      r`Think of guessing a number. You ask the middle, throw away half, and repeat. In one dimension that is binary search, and the Center of Gravity method does the same thing in $n$ dimensions. Take the center of gravity (the balance point) of the region that is still possible. Ask the slope there, which tells you which side is uphill. Throw away the uphill side, so the region gets smaller every round.`,

      { h: "What each symbol means" },
      {
        tbl: [
          ["Symbol", "Meaning"],
          [r`$X$`, "The allowed region (a convex shape)"],
          [r`$n$`, "Number of variables (dimension)"],
          [r`$S_t$`, r`Region still possible after $t$ rounds ($S_1 = X$)`],
          [r`$c_t$`, r`Center of gravity (balance point) of $S_t$`],
          [r`$g_t$`, r`Slope of $f$ at $c_t$`],
          [
            r`$\mathrm{vol}(S)$`,
            "Size of S: length in 1-D, area in 2-D, volume in 3-D",
          ],
          [r`$x^*,\ f^*$`, "The best point and the lowest value"],
          [
            r`$\Delta$`,
            r`Gap between the highest and lowest value of $f$ on $X$`,
          ],
          [r`$\hat{x}_t$`, "Best center tried so far"],
        ],
      },

      { h: "The algorithm" },
      r`1. Start with $S_1 = X$, so everything is still possible.`,
      "2. Find the center of gravity, which is the average of all points in the current region.",
      { eq: r`c_t = \frac{1}{\mathrm{vol}(S_t)} \int_{S_t} x \, dx` },
      r`3. Ask the slope $g_t$ at $c_t$. If $g_t = 0$, then $c_t$ is the minimum, so stop.`,
      "4. Keep only the side that is not uphill.",
      { eq: r`S_{t+1} = S_t \cap \{\, x : g_t \cdot (x - c_t) \le 0 \,\}` },
      r`5. Repeat. The answer is the best $c_s$ tried so far. There is no learning rate, so nothing to tune.`,
      r`In pictures: the slope $g_t$ points uphill, and the line through $c_t$ at right angles to $g_t$ is the cut. The uphill side is thrown away, and what is left is the next, smaller region.`,

      { h: "Derivation 1: why cutting is safe" },
      "The claim is that the minimum point is never thrown away.",
      "Step 1. The tangent line stays below the curve.",
      { eq: r`f(x) \ge f(c_t) + g_t \cdot (x - c_t)` },
      r`Step 2. We throw away $x$ only when $g_t \cdot (x - c_t) > 0$, the uphill side. For those points:`,
      { eq: r`f(x) \ge f(c_t) + (\text{something positive}) > f(c_t)` },
      r`Step 3. So every thrown-away point is worse than $c_t$. The minimum $x^*$ cannot be worse than $c_t$, so it is never thrown away.`,

      { h: "Derivation 2: how much is thrown away" },
      r`Here we use a fact due to Grünbaum. Cut any shape with a line through its center of gravity, and each side keeps at least $\left(\frac{n}{n+1}\right)^n$ of the size, which is never below $1/e$ (about 37%).`,
      r`The number comes from the worst-case shape, a cone of height $h$. Its center of gravity sits $\frac{h}{n+1}$ above the base. Cutting there, parallel to the base, leaves a small cone of height $\frac{nh}{n+1}$. Size scales like $(\text{height})^n$, so:`,
      { eq: r`\text{kept fraction} = \left(\frac{n}{n+1}\right)^{n}` },
      r`For $n = 1$ this is $1/2$, for $n = 2$ it is $4/9$ (about 44%), and as $n \to \infty$ it tends to $1/e$. Since each side keeps at least $1/e$, the side we keep is at most $1 - 1/e$, about 63% of the region. After $t-1$ cuts:`,
      {
        eq: r`\mathrm{vol}(S_t) \le \left(1 - \frac{1}{e}\right)^{t-1} \mathrm{vol}(X) \approx 0.63^{\,t-1}\, \mathrm{vol}(X)`,
      },

      { h: "Why the centroid?" },
      r`Cut near a corner and almost nothing goes. In a triangle, a cut near the tip removes only about 4%, so there is no guaranteed progress. Cut through the centroid and every side keeps at least $1/e$, so you always make real progress.`,

      { h: "Derivation 3: how fast does it converge?" },
      r`1. Shrink $X$ toward the best point $x^*$ by a factor $\varepsilon$ with $0 < \varepsilon < 1$. The shrunken copy has size $\varepsilon^n \cdot \mathrm{vol}(X)$.`,
      r`2. After $t$ rounds, if $0.63^{\,t-1} < \varepsilon^n$, our region is smaller than this copy, so some point $y$ of the copy was thrown away.`,
      r`3. Thrown away means $f(y) > f(c_s)$ for some center $c_s$ we tried (Derivation 1).`,
      r`4. But $y$ lies between $x^*$ and a point of $X$, so by the bowl shape, $f(y) \le f^* + \varepsilon\Delta$.`,
      r`5. So some center we tried is within $\varepsilon\Delta$ of the best value. Choosing $\varepsilon = 0.63^{(t-1)/n}$ gives:`,
      {
        eq: r`f(\hat{x}_t) - f^* \le \Delta \left(1 - \frac{1}{e}\right)^{\frac{t-1}{n}} \approx \Delta\, e^{-0.46\,\frac{t-1}{n}}`,
      },
      "In words: every n rounds the error shrinks by a factor of about 0.63.",

      { h: "How many rounds for a given accuracy?" },
      r`Set the error bound equal to $\varepsilon$ and solve for $t$.`,
      { eq: r`t \approx 1 + 2.18\, n \ln\frac{\Delta}{\varepsilon}` },
      r`Here $2.18 = 1 / \ln\frac{e}{e-1}$, which comes from the 0.63 factor. For example, take $n = 10$ variables and an error of $10^{-6}$ of the range $\Delta$. Then $\ln(10^6) \approx 13.8$, so:`,
      {
        eq: r`t \approx 1 + 2.18 \cdot 10 \cdot 13.8 \approx 300 \text{ questions}`,
      },
      r`Plain subgradient descent can need about $(1/\varepsilon)^2 = 10^{12}$ steps for the same accuracy in the worst case, ignoring constants. The cost of the Center of Gravity method grows with the number of digits you want and with $n$.`,

      { h: "A worked example in one dimension" },
      r`Take $f(x) = (x - 0.3)^2$ on $X = [0, 1]$. In one dimension the center of gravity is just the midpoint, and the slope is $g = 2(c - 0.3)$.`,
      {
        tbl: [
          [
            r`$t$`,
            r`Region $S_t$`,
            r`Center $c=\frac{a+b}{2}$`,
            r`Slope $g=2(c-0.3)$`,
            r`$f(c)$`,
            "Keep",
          ],
          [
            "1",
            r`$[0,\,1]$`,
            r`$0.5$`,
            r`$+0.4$`,
            r`$0.04$`,
            r`$x \le 0.5$`,
          ],
          [
            "2",
            r`$[0,\,0.5]$`,
            r`$0.25$`,
            r`$-0.1$`,
            r`$0.0025$`,
            r`$x \ge 0.25$`,
          ],
          [
            "3",
            r`$[0.25,\,0.5]$`,
            r`$0.375$`,
            r`$+0.15$`,
            r`$0.0056$`,
            r`$x \le 0.375$`,
          ],
          [
            "4",
            r`$[0.25,\,0.375]$`,
            r`$0.3125$`,
            r`$+0.025$`,
            r`$0.00016$`,
            r`$x \le 0.3125$`,
          ],
          [
            "5",
            r`$[0.25,\,0.3125]$`,
            r`$0.28125$`,
            r`$-0.0375$`,
            r`$0.00035$`,
            r`$x \ge 0.28125$`,
          ],
        ],
      },
      r`A positive slope means the minimum is on the left, so we keep $x \le c$. A negative slope means it is on the right, so we keep $x \ge c$. The region halves each round and always contains $0.3$, which is exactly binary search. The answer is the best center tried, $c_4 = 0.3125$ with $f = 0.00016$, not the last center $c_5$, which has $f = 0.00035$.`,
      {
        code: `def f(x): return (x - 0.3) ** 2
def grad(x): return 2 * (x - 0.3)

a, b = 0.0, 1.0
best_c, best_f = None, float("inf")
for t in range(1, 6):
    c = (a + b) / 2            # center of gravity of [a, b]
    g = grad(c)
    if f(c) < best_f:
        best_c, best_f = c, f(c)
    if g == 0:
        break
    if g > 0:
        b = c                  # keep x <= c
    else:
        a = c                  # keep x >= c

print(best_c, best_f)          # 0.3125 0.00015625`,
      },

      { h: "Center of Gravity versus RMSProp and SGD" },
      {
        tbl: [
          ["", "Center of gravity", "RMSProp / SGD"],
          ["What it does", "Shrinks a search region", "Moves one point"],
          ["Settings to tune", "None", r`$\eta,\ \beta,\ \varepsilon$`],
          ["Needs", "Slope (gradient)", "Gradient (often minibatch)"],
          [
            "Guarantee",
            r`Error shrinks geometrically for any convex $f$`,
            r`SGD: slow $1/\sqrt{t}$. RMSProp: none in general`,
          ],
          ["Cost per round", "High: find the center of gravity", r`Low: $O(n)$`],
          ["Works for deep nets", "No", "Yes"],
        ],
      },
      "The Center of Gravity method is a clean theory result for small n. RMSProp is a cheap practical tool for huge models.",

      { h: "Advantages and limitations" },
      r`Advantages: there is no learning rate to tune, and the guarantee is clear, with the error dropping by 0.63 every $n$ rounds. It works even if $f$ has kinks, so no smoothness is needed, and the minimum is never lost.`,
      "Limitations: finding the center of gravity of a complicated shape is very hard. Every round adds one more cut, so the shape keeps getting more complex, and the method is practical only for a small number of variables. Two workarounds are to estimate the center by random sampling, or to use the ellipsoid method, which has an easier update but a slower rate.",

      { h: "When it fails" },
      r`It only works when $f$ is convex. Suppose $f$ has two valleys. At a point $c$ the slope is positive, so the rule throws away everything on the right. If the true minimum sits in the right-hand valley, it is lost for good. This is why the method is only safe for convex $f$.`,

      { h: "Things to remember" },
      r`It shrinks a region. It does not move a single point. Output the best center tried, not the last one: $f(c_t)$ need not go down every round, only the region size does. It needs a convex $f$, so it is not used to train neural networks. It is a theory benchmark, and its practical relatives are the ellipsoid method and other cutting-plane methods. The center of gravity is the centroid, the average position of the region with uniform density.`,

      { h: "Summary" },
      r`One round: take the center of gravity $c_t$ of $S_t$, ask the slope $g_t$ there, and keep only the points with $g_t \cdot (x - c_t) \le 0$. A safe cut (Derivation 1) that removes a guaranteed share of the region (Derivation 2) gives this bound:`,
      {
        eq: r`f(\hat{x}_t) - f^* \le \Delta \left(1 - \frac{1}{e}\right)^{\frac{t-1}{n}}`,
      },
      "No learning rate, and the error falls by about 0.63 every n rounds.",
    ],
  });
})();
