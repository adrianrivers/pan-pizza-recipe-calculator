import { useMemo, useState } from 'react'
import { recipeSteps } from './steps/pan-pizza-steps'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from './components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from './components/ui/button'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Recipe } from './components/pdf/recipe'

export type UnitSystem = 'metric' | 'imperial'

export interface PizzaDoughPercentage {
  breadFlour: number
  wholemealFlour?: number
  diastaticMaltPowder: number
  yeast: number
  water: number
  salt: number
}

export interface PizzaDoughRecipe extends PizzaDoughPercentage {
  totalWeight: number
}

export interface Pan {
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

function calculateRecipe(
  totalFlourWeight: number,
  bakersPercentage: PizzaDoughPercentage,
): PizzaDoughRecipe {
  let totalWeight = 0
  const recipe: PizzaDoughRecipe = {
    breadFlour: 0,
    wholemealFlour: 0,
    diastaticMaltPowder: 0,
    yeast: 0,
    water: 0,
    salt: 0,
    totalWeight: 0,
  }

  for (const [ingredient, percentage] of Object.entries(bakersPercentage)) {
    const ingredientWeight = (totalFlourWeight * percentage) / 100
    totalWeight += Math.round(ingredientWeight)

    if (
      ingredient === 'yeast' ||
      ingredient === 'salt' ||
      ingredient === 'diastaticMaltPowder'
    ) {
      recipe[ingredient as keyof PizzaDoughRecipe] = Number(
        ingredientWeight.toFixed(1),
      )
      continue
    }

    recipe[ingredient as keyof PizzaDoughRecipe] = Math.round(ingredientWeight)
  }

  return {
    ...recipe,
    totalWeight,
  }
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

    return calculateRecipe(totalFlourWeight, seventyFivePercent)
  }, [totalFlourWeight])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setPan((prev) => ({ ...prev, [name]: Number(value) }))
  }

  return (
    <main className="w-full max-w-screen-lg mx-auto px-12 py-12">
      <h1>Pan Pizza Recipe Calculator</h1>

      <section className="my-12 p-12 border rounded border-gray-100">
        <Table className="my-6">
          <TableHeader>
            <TableRow>
              <TableHead>Measurement</TableHead>
              <TableHead>Input</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Width ({measurement})</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={pan.w || ''}
                  name="w"
                  onChange={handleChange}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Length ({measurement})</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={pan.l || ''}
                  name="l"
                  onChange={handleChange}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Number of pizzas</TableCell>
              <TableCell>
                <Input
                  required
                  min={1}
                  type="number"
                  value={numPizzas || ''}
                  name="numPizzas"
                  onChange={(e) => setNumPizzas(Number(e.target.value))}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Select onValueChange={(value) => setUnitSystem(value as UnitSystem)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue defaultValue={'metric'} placeholder="Metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="metric">Metric</SelectItem>
            <SelectItem value="imperial">Imperial</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="my-12 p-12 border border-gray-100 rounded">
        <div className="flex justify-between">
          <h2>Dough Recipe</h2>

          {recipe && (
            <Button asChild variant="outline">
              <PDFDownloadLink
                document={
                  <Recipe
                    recipe={recipe}
                    pan={pan}
                    numPizzas={numPizzas}
                    unitSystem={unitSystem}
                  />
                }
              >
                Download PDF
              </PDFDownloadLink>
            </Button>
          )}
        </div>

        <Table className="my-6">
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Weight (grams)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipe && (
              <>
                {Object.keys(recipe).map((key) => (
                  <TableRow key={key}>
                    <TableCell className="lowercase first-letter:capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </TableCell>
                    <TableCell>{recipe[key as keyof typeof recipe]}</TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>

        {recipe && (
          <>
            <h2>Instructions</h2>
            <ol className="list-decimal my-6 ml-6">
              {recipeSteps.map((step, index) => (
                <li className="mt-6 text-lg" key={index}>
                  {step}
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </main>
  )
}

export default App
