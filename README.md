:warning: *Use of this software is subject to important terms and conditions as set forth in the License file* :warning:

# Customer Lookup App

## Description:

This is a New Zendesk App to streamline the process of manually logging incoming calls.

**Notes**

* The name and organisation field automatically capitalise the first letter of every word.
* There is validation on the email address to make sure it is entered in the correct format.
* There is an auto-suggest dropdown on the organisation field to select an existing organisation. If no matching organisation is found, you simply type the name of the organisation and it will be created when you add the user.

## App location:

* Ticket sidebar

## Features:

* Set a new user as the requester
* Create tickets for new users
* Do lookups based on telephone numbers

## Set-up/installation instructions:

You can specify in the admin settings if you want tickets created with this app automatically tag and which fields for adding a new user are required:

![admin settings](https://www.evernote.com/shard/s215/sh/8fec7086-65a9-408f-8674-d02dbd972b99/1290aa349837bc64001c1a5bae451cb4/deep/0/Screen%20Shot%202013-08-29%20at%2016.14.03.png "App Settings")

## Contribution:

Pull requests are welcome.

## Screenshot(s):

The agent inputs a telephone number into the app and then a lookup is performed for users with that telephone number.

![input field](https://www.evernote.com/shard/s215/sh/14a12d2e-7563-443a-b569-eb50222453be/297f9f07c185e76c52b9e466364b3cbb/deep/0/Toby's%20Support%20-%20Agent.png "Input Telephone Number")

If a user is found, you can set that user as the requester of the ticket.

![one user](https://www.evernote.com/shard/s215/sh/4c65f209-f10d-46a2-a643-e09740b3e526/0b03e6ac6e6dafc5a69c9abcc5e8c04c/deep/0/Toby's%20Support%20-%20Agent.png "One User Result")

If multiple users are found, the agent can select which user to set as the requester.

![multiple users](https://www.evernote.com/shard/s215/sh/2964002e-cb6a-45a6-9dc4-ec74f719b113/c8dd9f92c56eb8ff155921ab280b2744/deep/0/Toby's%20Support%20-%20Agent.png "Multiple Users Result")

If no users are found, a simple form appears that allows the agent to create a new user. There are 3 fields: name, email and organisation.

![new user form](https://www.evernote.com/shard/s215/sh/4ee26795-8d41-4ab7-bedc-d52c13954be4/1c2fd64dc3398cf718f39c27754d1c85/deep/0/Toby's%20Support%20-%20Agent.png "Add New User")




