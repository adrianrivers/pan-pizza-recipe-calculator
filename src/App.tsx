import { useState } from 'react'
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
import { RecipePDF } from './components/pdf/recipe-pdf'
import { useReward } from 'react-rewards'

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

  const { reward } = useReward('rewardId', 'emoji', {
    emoji: ['🍕'],
    elementSize: 35,
  })

  const measurement = unitSystem === 'metric' ? 'cm' : 'in'

  let panArea

  if (unitSystem === 'metric') {
    panArea = (pan.w / 2.54) * (pan.l / 2.54)
  } else {
    panArea = pan.w * pan.l
  }

  const panDoughVolume = panArea * 0.1035 * 28.35 * numPizzas

  const bakerPercentTotal = Object.values(seventyFivePercent).reduce(
    (sum, value) => sum + value,
    0,
  )

  const totalFlourWeight = panDoughVolume
    ? (panDoughVolume * 100) / bakerPercentTotal
    : 0

  const recipe = totalFlourWeight
    ? calculateRecipe(totalFlourWeight, seventyFivePercent)
    : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    reward()
    setPan((prev) => ({ ...prev, [name]: Number(value) }))
  }

  return (
    <div className="bg-gooey-pizza">
      <header className="mx-auto w-full max-w-screen-lg px-12 pt-12">
        <span className="inline-block bg-yellow-400 px-4 py-2">
          <h1 className="text-red-500">Pan Pizza Recipe Calculator</h1>
        </span>
      </header>
      <main className="mx-auto w-full max-w-screen-lg px-2 py-12 lg:p-12">
        <section className="mb-12 rounded border-4 border-yellow-200 bg-white p-4 lg:p-12">
          <h2>Your specifications</h2>

          <Table className="my-6 text-base">
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
                  <span
                    id="rewardId"
                    style={{ width: 2, height: 2, background: 'red' }}
                  />
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
                    onChange={(e) => {
                      reward()
                      setNumPizzas(Number(e.currentTarget.value))
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Select
            onValueChange={(value) => {
              reward()
              setUnitSystem(value as UnitSystem)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue defaultValue={'metric'} placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric</SelectItem>
              <SelectItem value="imperial">Imperial</SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="my-12 rounded border-4 border-red-200 bg-white p-4 lg:p-12">
          <div className="flex justify-between">
            <h2>Dough Recipe</h2>

            {recipe && (
              <Button
                asChild
                className="border-yellow-400 bg-red-500 text-white hover:bg-red-400"
              >
                <PDFDownloadLink
                  fileName="pan-pizza-recipe.pdf"
                  document={
                    <RecipePDF
                      recipe={recipe}
                      pan={pan}
                      numPizzas={numPizzas}
                      measurement={measurement}
                    />
                  }
                >
                  Download PDF
                </PDFDownloadLink>
              </Button>
            )}
          </div>

          <Table className="my-6 text-base">
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Weight (grams)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipe ? (
                <>
                  {Object.keys(recipe).map((key) => (
                    <TableRow key={key}>
                      <TableCell className="lowercase first-letter:capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </TableCell>
                      <TableCell>
                        {recipe[key as keyof typeof recipe]}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <p className="p-4">Please enter your specifications</p>
              )}
            </TableBody>
          </Table>

          <>
            <h2>Instructions</h2>
            <ol className="my-6 ml-8 list-decimal md:ml-6">
              {recipeSteps.map((step, index) => (
                <li className="mt-6 text-base" key={index}>
                  {step}
                </li>
              ))}
            </ol>
          </>

          <iframe
            className="w-full"
            height="500"
            src="https://www.youtube.com/embed/CJEoASUMZbI?si=ki4_O-x0P5x3YSeL"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </section>
      </main>
    </div>
  )
}

export default App
