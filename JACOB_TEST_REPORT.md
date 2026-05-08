Website Location: Website can not be found by regular web search including a direct search. Website can only be accessed through Direct URL in top search bar.



Issue format: Error // Location of error // Detailed description of issue  // My recommended solution if any and/or thoughts



All issues I found are as follows.



Critical:

* Job decoder failing // Main Page->Job Decoder // Fails to provide a response siting Analysis failed:429 when attempt are made // Find what error 429 is and act accordingly
* Interview Coach and Ai coach use the same tokens // Main Page->Ai Coach || Command Center->Bank->Ai Coach // Despite different functions they share a name and token count // If this is intentional disregard this error, if it is not intentional please separate whatever it is that connects the two
* Follow up email fails // Main Page->Follow Up Email // Follow up email fails to generate // I don't know the cause so an answer can not be provided
* Star drill fails // Main Page->Star Drill: Result // Star drill fails to evaluate response // I don't know the cause so a solution can not be provided
* Story bank fails to match // Main Page->Story Bank // When pressing match stories to see coverage it fail to run // I don't know the cause so a solution can not be provided
* Job focus fails // Command Center->Bank->Job Focus // Pressing curate my role fails to load anything siting Analysis failed: 429 // Find the cause of error 429 and act accordingly
* Ai interviewers questions break // Main Page->Ai Interviewer // During an Ai interview pressing next begins to cycle through your questions in the bank rather than move through the Ai interviewers questions // Either find why the function grabs the wrong information or remove the option to press next and prev all together
* Annual access pass failed // Settings->Subscription // After purchasing a 30 day pass attempting to purchase the annual path meets the user with the message (You specified `payment` mode but passed a recurring price. Either switch to `subscription` mode or use only one-time prices.). I don't know if that is due to me already having the 30 pass or if that would show regardless // I don't know the cause so a solution can not be given



High:

* Questions fail to get added // Command Center->Bank->Add Question || Command Center->Bank->Question catalog // When opening one of the two mentioned tabs to add question, if you change tabs and then comeback it will no longer load questions // I don't Know the exact issue so a solution can not be provided
* Question answers fail to update // Command Center->Bank->Edit question // If you press edit question and before hitting save switch tabs and then come back the edits will no longer save // I Don't know the exact cause so a solution can not be provided
* Ai Coach answer not saving // Command Center->Bank->Ai Coach // After completing the Ai coaches questions the answer it gives you won't save // I don't know the cause so a solution can not be provided
* Generated questions added twice // Command Center->Bank->Question Generator // Question generator adds each saved question twice // I don't know the cause so a solution can not be provided
* Interview date function takes input from other function // Command Center->Prep // When using other functions the interview date function will pull information into a jumbled mess // Find why it pulls information and remove that capability
* False advertisement issue // Main Page->Live Prompter // At 7 uses it prompts the user to edit question to get "Unlimited access". However that is not true and could be a point of issue if a user brings it up // Change the text present in that message to be more accurate
* Timer doesn't work in practice mode // Main Page->Practice // Timed option seems to do nothing // I don't know the cause so a solution can not be provided



Medium:

* Delete all question button has an issue // Command Center->Bank->Delete All Questions // When hitting the mentioned button and clicking confirm it will display the text (Failed to delete data: Could not find the table 'public.practice\_history' in the schema cache) and then the confirmation window will not close. If you close the window and refresh the page the questions will be deleted but the experience is quite jarring and should be fixed // My assumption based on the error is it's trying to delete a table that doesn't exist. If that table would normally exist after practicing the question then add an if statement that checks if the table exists and if it doesn't move past that part of the function and if it is there to delete it. However if the table doesn't exist at all and is left over code in the function simply cleaning the function's code should clean up the error.
* Question catalog is awkward to use // Command Center->Bank->Question Catalog // After selecting a question group or single question it kicks the user out of the catalog. That is a very jarring action that doesn't really need to happen // Remove the part of the function responsible for the force kick
* Ai couch still saying rush answer when a full answer is developed // Command Center->Bank->Ai Coach // When using the Ai coach for stronger answers it can finish with it's answer in less than the required amount of questions // I'd recommend adding a flag that when the ai coach thinks it has a strong enough answer it will override the amount of questions required
* Live prompter tokens are inconsistent // Main Page->Live Prompter // Tokens are not consumed if you start an interview and then change tabs back and forth. Once you have done that it will stop tracking the amount of questions // I don't know the cause so a solution can not e provided
* Practice mode fails give feedback // Main Page->Practice // If you switch tabs while inside of practice mode it will no longer generate feedback until the page is refreshed // I don't know the cause so a solution can not be provided
* Practice mode token exploit // Main Page->Practice // If the user switches tabs while the Ai is evaluating the answer it will still give feedback but fail to consume a token // Not a huge issue but could be bad if found and exploited. I don't know the cause so a solution can not be provided
* Redundancy with passes // Settings->Subscription // The annual pass says it also has unlimited Ai coach usage but the 30 day pass already has that. // Fix the text so it is more accurate



Low:

* Contact support doesn't function as a button // Setting->Contact support // Clicking on contact support opens a browser and then does nothing // Either fix the function of the button or remove it as a button and readd it as a line of text only
* No clean access to tutorial // N/A // There is no way to reopen the tutorial without deleting your account and re signing up // Add a tutorial button in settings that re shows the initial tutorial.
* Back arrow brings user to main page rather than one page back // Settings->Privacy Policy || Settings->Terms of service || // N/A // Make each page where this can occur have an individual flag and when you run the "back" function, or what ever it is called, it will check the flag and move the user to the previous flag rather than default to the main page.
* Date till interview still displayed incorrectly // Command Center->Prep // When setting an interview date it says you have one extra day than you should. It also doesn't leave when they date has already passed // Update the day tracking to be accurate and disappear when the days would = -1 or less   \*This only affects the Prompt in the command center. On the main page the days are shown correctly. But you may want to add some fan fair when it shows zero days.
* Pressing explore question bank send to the wrong place // Main Page->Explore Question Bank // When pressing the button it will open the command center but not set the sub tab to the question bank, instead it will open which ever sub tab the user had selected last // Set the buttons path to the sub tab as well, for example (Main Page\\Command Center\\Bank)
* Question generator can be exploited // Command Center->Bank->Question Generator // After having a question generated it won't cost a token until a question is save. This leads to an issue where someone can just copy and paste the question given somewhere else and keep generating more questions. They can even close out of the generator and it won't consume a token making it possible to generate hundreds of questions without consuming any tokens // Add a limit of 3-5 where once they press try another that many times it will consume a token to reduce the efficacy of the exploit. I don't recommend making it take a token for every question generated as it will make getting a question hey want harder than is necessary as well as the fact that the window may close when switching tabs leading to the question not being savable but still consuming a token.
* Practice will not open // Main Page->Practice // After switching tabs while on the main page practice mode will no longer run through the practice button // I don't know the cause so a solution can not be provided
* Your prep journeys send to weird place // Main Page->Ready (Your prep journey) // When pressing the ready button on the prep journey graphic it opens the command center for some reason // If that is intentional disregard this error. Otherwise stop it from sending anywhere or send somewhere that makes more sense for a button that says you are interview ready



Notes:



This is by far the longest set of error notes due to the large amount of functions added since last full user test. I tested everything I could think about when using the users likely actions as a reference even stepping out of that boundary to test possible edge cases. I may have missed some things but i am confident I got most if not all of the issues a normal user would run into during average usage. Anything not talked about in the error notes is running smoothly as intended. As for the subscription please refund that whenever you get the chance. I apologize for just how long this file is but I figured it is better to be thorough to not leave anything unaccounted for. Assuming normal operations the webpage should be completely bug free once this list is gone through assuming no new bugs are added during the process of fixing the current ones. I hope you have a good rest of your day or night and once again I am sorry for the length of this file.

