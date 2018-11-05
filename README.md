# arg-psych
Aggressive Response Game (ARG) is a psychological task designed to measure impulsive aggression

# How to play
Open up the index.html on any modern browser, and start playing!

# Settings for the game

You can change a lot of the games settings:

| Variable Name   | Type     | Effect                                                                     |
|-----------------|----------|----------------------------------------------------------------------------|
| maxTokens       | integer  | Changes the maximum amount of tokens allowed                               |
| computerPlay    | [{}]     | List of the computer players actions                                       |
| tokenConversion | function | Converts integer amount of tokens to number amount of coins                |
| sendMessage     | function | Returns true/false if there should be a message box displayed at that time |
