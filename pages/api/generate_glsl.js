import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  let glsl = req.body.glsl || '';
  let query = req.body.query || '';
  if (glsl.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid glsl",
      }
    });
    return;
  }

  try {
    const payload = {
      model: "text-davinci-003",
      prompt: generatePrompt(glsl, query),
      temperature: 0.,
      max_tokens:500,
    }
    console.log('payload', payload)
    const completion = await openai.createCompletion(payload);
    console.log('completion data choices', completion.data.choices)
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(glsl, query) {

    return `You are a creative coding assistant who is going to help me write glsl sketches.  Please respond only with the code that should be run, no explanations.  I will put the current code between [BEGIN] and [END] tokens, with the query of how i'd like you to modify the sketch below.  Be sure to only respond with the full representation of the modified code and no editorial or explanations. 
    Here it is:
    [BEGIN]${glsl}[END]
    ${query}
    `;
}





