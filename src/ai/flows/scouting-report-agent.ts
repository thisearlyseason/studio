'use server';
/**
 * @fileOverview A Genkit flow that generates professional scouting reports.
 * 
 * - generateScoutingBrief - Analysis engine for opponent tactics.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScoutingInputSchema = z.object({
  opponentName: z.string(),
  sport: z.string(),
  rawObservations: z.string().describe('Coach observations about the opponent, player tendencies, or previous match notes.'),
});

const ScoutingOutputSchema = z.object({
  strengths: z.string().describe('Key tactical advantages of the opponent.'),
  weaknesses: z.string().describe('Identified areas for exploitation.'),
  keysToVictory: z.string().describe('Direct tactical instructions for the squad.'),
  suggestedDrillFocus: z.string().describe('Recommended training priority for this match-up.'),
});

export async function generateScoutingBrief(input: z.infer<typeof ScoutingInputSchema>) {
  const flow = ai.defineFlow(
    {
      name: 'generateScoutingBriefFlow',
      inputSchema: ScoutingInputSchema,
      outputSchema: ScoutingOutputSchema,
    },
    async (input) => {
      const prompt = ai.definePrompt({
        name: 'scoutingPrompt',
        input: { schema: ScoutingInputSchema },
        output: { schema: ScoutingOutputSchema },
        prompt: `You are an Elite Tactical Analyst for a professional {{{sport}}} team.
        
        Analyze the following coach observations for the upcoming match against {{{opponentName}}}:
        
        OBSERVATIONS:
        {{{rawObservations}}}
        
        Generate a structured, high-performance scouting report that identifies strategic patterns and exploit points.`,
      });

      const { output } = await prompt(input);
      return output!;
    }
  );

  return flow(input);
}
