import { useMemo, useState } from 'react'
import { recipeSteps } from './steps/pan-pizza-steps'

type UnitSystem = 'metric' | 'imperial'

interface PizzaDoughPercentage {
  breadFlour: number
  wholemealFlour?: number
  diastaticMaltPowder: number
  yeast: number
  water: number
  salt: number
}

interface Pan {
  w: number
  l: number
}

const seventyFivePercent: PizzaDoughPercentage = {
  breadFlour: 95,
  wholemealFlour: 5,
  diastaticMaltPowder: 1,
  yeast: 0.5,
  water: 75,
  salt: 2,
}

function calculateIngredientWeight(
  totalFlourWeight: number,
  bakersPercentage: number,
  showDecimal = false,
) {
  const ingredientWeight = (totalFlourWeight * bakersPercentage) / 100

  return showDecimal
    ? Number(ingredientWeight).toFixed(1)
    : Math.round(ingredientWeight)
}

function App() {
  const [pan, setPan] = useState<Pan>({ w: 28, l: 40 })
  const [numPizzas, setNumPizzas] = useState(1)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')

  const measurement = unitSystem === 'metric' ? 'cm' : 'in'

  const panDoughVolume = useMemo(() => {
    if (!pan.w || !pan.l || !numPizzas) return 0
    let panArea = 0

    if (unitSystem === 'metric') {
      panArea = (pan.w / 2.54) * (pan.l / 2.54)
    } else {
      panArea = pan.w * pan.l
    }

    return panArea * 0.1035 * 28.35 * numPizzas
  }, [pan, unitSystem, numPizzas])

  const totalFlourWeight = useMemo(() => {
    if (!panDoughVolume) return 0

    const bakerPercentTotal = Object.values(seventyFivePercent).reduce(
      (sum, value) => sum + value,
      0,
    )

    return (panDoughVolume * 100) / bakerPercentTotal
  }, [panDoughVolume])

  const recipe = useMemo(() => {
    if (!totalFlourWeight) return null

    return {
      ['bread-flour']: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent.breadFlour,
      ),
      ['wholemeal-flour']: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent?.wholemealFlour ?? 0,
      ),
      ['diastatic-malt-powder']: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent.diastaticMaltPowder,
        true,
      ),
      yeast: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent.yeast,
        true,
      ),
      water: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent.water,
      ),
      salt: calculateIngredientWeight(
        totalFlourWeight,
        seventyFivePercent.salt,
        true,
      ),
    }
  }, [totalFlourWeight])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setPan((prev) => ({ ...prev, [name]: Number(value) }))
  }

  return (
    <>
      <h3>Input</h3>

      <label htmlFor="unit-system">Unit system</label>
      <select onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}>
        <option value="metric">Metric</option>
        <option value="imperial">Imperial</option>
      </select>

      <table className="border-collapse table-auto w-full text-sm">
        <tbody>
          <tr>
            <th className="border-b dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">
              Width {measurement}
            </th>
            <td>
              <input
                required
                min={1}
                type="number"
                value={pan.w || ''}
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
                value={pan.l || ''}
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
                  <td style={{ textTransform: 'capitalize' }}>
                    {key.replace(/-/g, ' ')}
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
            {recipeSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </>
      )}
    </>
  )
}

export default App
