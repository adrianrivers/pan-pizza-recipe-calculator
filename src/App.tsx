import { useMemo, useState } from "react";

type UnitSystem = "metric" | "imperial";

interface PizzaDoughPercentage {
  breadFlour: number;
  wholemealFlour?: number;
  diastaticMaltPowder: number;
  yeast: number;
  water: number;
  salt: number;
}

interface Pan {
  w: number;
  l: number;
}

const seventyFivePercent: PizzaDoughPercentage = {
  breadFlour: 95,
  wholemealFlour: 5,
  diastaticMaltPowder: 1,
  yeast: 0.5,
  water: 75,
  salt: 2,
};

function calculateIngredientWeight(
  totalFlourWeight: number,
  bakersPercentage: number,
  showDecimal = false
) {
  const ingredientWeight = (totalFlourWeight * bakersPercentage) / 100;

  return showDecimal
    ? Number(ingredientWeight).toFixed(1)
    : Math.round(ingredientWeight);
}

function App() {
  const [pan, setPan] = useState<Pan>({ w: 28, l: 40 });
  const [numPizzas, setNumPizzas] = useState(1);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  const measurement = unitSystem === "metric" ? "cm" : "in";

  const panDoughVolume = useMemo(() => {
    if (!pan.w || !pan.l || !numPizzas) return 0;
    let panArea = 0;

    if (unitSystem === "metric") {
      panArea = (pan.w / 2.54) * (pan.l / 2.54);
    } else {
      panArea = pan.w * pan.l;
    }

    return panArea * 0.1035 * 28.35 * numPizzas;
  }, [pan, unitSystem, numPizzas]);

  const totalFlourWeight = useMemo(() => {
    if (!panDoughVolume) return 0;

    const bakerPercentTotal = Object.values(seventyFivePercent).reduce(
      (sum, value) => sum + value,
      0
    );

    return (panDoughVolume * 100) / bakerPercentTotal;
  }, [panDoughVolume]);

  const recipe = useMemo(() => {
    if (!totalFlourWeight) return null;

    return {
      ["bread-flour"]: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent.breadFlour
      ),
      ["wholemeal-flour"]: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent?.wholemealFlour ?? 0
      ),
      ["diastatic-malt-powder"]: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent.diastaticMaltPowder,
        true
      ),
      yeast: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent.yeast,
        true
      ),
      water: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent.water
      ),
      salt: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent.salt,
        true
      ),
    };
  }, [totalFlourWeight]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setPan((prev) => ({ ...prev, [name]: Number(value) }));
  };

  return (
    <>
      <h3>Input</h3>

      <label htmlFor="unit-system">Unit system</label>
      <select onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}>
        <option value="metric">Metric</option>
        <option value="imperial">Imperial</option>
      </select>

      <table>
        <tbody>
          <tr>
            <th>Width {measurement}</th>
            <td>
              <input
                required
                min={1}
                type="number"
                value={pan.w || ""}
                name="w"
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th>Length {measurement}</th>
            <td>
              <input
                type="number"
                required
                min={1}
                value={pan.l || ""}
                name="l"
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th>Number of pizzas</th>
            <td>
              <input
                type="text"
                required
                min={1}
                placeholder="1"
                value={numPizzas}
                onChange={(e) => setNumPizzas(Number(e.currentTarget.value))}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Dough Recipe</h3>

      <table>
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>Weight (grams)</th>
          </tr>
        </thead>
        <tbody>
          {recipe && (
            <>
              {Object.keys(recipe).map((key) => (
                <tr key={key}>
                  <td style={{ textTransform: "capitalize" }}>
                    {key.replace(/-/g, " ")}
                  </td>
                  <td>{recipe[key as keyof typeof recipe]}</td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>

      {totalFlourWeight && (
        <>
          <h3>Instructions</h3>

          <ol>
            <li>
              In a large bowl, mix all the ingredients except for the salt until
              thoroughly incorporated. Cover the bowl and let the dough rest for
              20 minutes.
            </li>
            <li>Add the salt and work it into the dough.</li>
            <li>
              Cover the bowl and allow the dough to rise until it has grown in
              size by about 50%. This will take about 1-2 hours. During this
              time, come back every 20 minutes to perform a set of
              stretch-and-folds (perform up to 4 sets). If the dough hasn’t
              grown by 50% after the 4th set, let it rest at room temperature
              until it has.
            </li>
            <li>
              Transfer the dough to the refrigerator to rest for 1-4 days (2 or
              3 days is ideal).
            </li>
            <li>
              On the morning of baking (about 3-4 hours before baking), prepare
              your Detroit-style pizza pans by coating them with a thin layer of
              neutral oil.
            </li>
            <li>
              Remove the dough from the refrigerator, divide it into your
              desired number of portions, form each one into a taut ball, and
              place it into its own pizza pan.
            </li>
            <li>
              Stretch the dough to the edges of the pan. (It may shrink back
              toward the center, but that's okay.)
            </li>
            <li>
              Cover the dough and let it rest for 30 minutes. Then, stretch the
              dough further to the edges. Repeat this every 30 minutes until the
              dough stays in the corners of the pan.
            </li>
            <li>
              Cover the dough and let it rise until it is soft and airy (about
              2-3 times in size from when it was removed from the fridge). This
              should take about 1-2 hours.
            </li>
            <li>
              When the dough is about 30 minutes from being ready, preheat your
              oven to the highest possible temperature, and set the oven rack to
              the middle setting.
            </li>
            <li>
              Partially top the dough, starting with a layer of pepperoni (if
              using), followed by a very light layer of cheese, being careful
              not to put too much cheese near the edges. Bake for 7-8 minutes at
              your oven's highest temperature.
            </li>
            <li>
              Remove the pizza from the oven, and finish topping it by placing
              the rest of the cheese, focusing on the edges, followed by the
              sauce in a "racing stripe" pattern, and any additional toppings
              you want to use.
            </li>
            <li>
              Finish baking the pizza at the highest temperature for another 4-5
              minutes until the cheese at the edges is browned to your liking.
            </li>
            <li>
              Remove the pizza from the pan as soon as possible after taking it
              out of the oven. Ideally, place the pizza onto a wire rack to cool
              for a few minutes before cutting into it.
            </li>
          </ol>
        </>
      )}
    </>
  );
}

export default App;
