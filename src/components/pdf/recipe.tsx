import { Pan, PizzaDoughRecipe } from '@/App'
import { recipeSteps } from '@/steps/pan-pizza-steps'
import { Page, Text, View, Document } from '@react-pdf/renderer'

export const Recipe = ({
  recipe,
  pan,
  numPizzas,
  measurement,
}: {
  recipe: PizzaDoughRecipe
  pan: Pan
  numPizzas: number
  measurement: string
}) => (
  <Document>
    <Page
      size="A4"
      style={{
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 35,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          textDecoration: 'underline',
          marginBottom: 10,
        }}
      >
        Pan Pizza Recipe 🍕
      </Text>

      <Text
        style={{
          fontSize: 12,
          marginBottom: 12,
          padding: 4,
        }}
      >
        Recipe is for {numPizzas} pizza(s) baked in a {pan.w}x{pan.l}{' '}
        {measurement} pan
      </Text>

      {
        <View style={{ marginBottom: 12 }}>
          {Object.keys(recipe).map((key) => (
            <View key={key} style={{ display: 'flex', flexDirection: 'row' }}>
              <Text
                style={{
                  margin: 6,
                  fontSize: 12,
                  textAlign: 'justify',
                }}
              >
                -{' '}
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim()}
                {': '}
                {recipe[key as keyof typeof recipe]} gram(s)
              </Text>
            </View>
          ))}
        </View>
      }

      <Text
        style={{
          fontSize: 14,
          marginBottom: 8,
          textDecoration: 'underline',
        }}
      >
        Instructions
      </Text>
      {recipeSteps.map((item, index) => (
        <View>
          <Text
            style={{
              margin: 6,
              fontSize: 12,
              textAlign: 'justify',
            }}
          >
            {index + 1}. {item}
          </Text>
        </View>
      ))}
    </Page>
  </Document>
)
