def format_list(list):
    """Accepts a list and returns a format string that you can use
    as a parameter for any query that accepts a list as a parameter."""
    return ','.join(['%s'] * len(list))

#Create a user
#params: username and password of new user. Password is not encrypted in any way.
new_user = "insert into User values (%s, %s)"

#validate a user
#params: username and password to validate.
#returns 1 if the password is correct, 0 otherwise
validate_user = "select count(1) from User where username = %s and password = %s"

#Get all preference sets for a given user
#params: username
#returns all preference sets that are associated with username
get_preference_sets = "select * from Preference_set where user = %s"

#Get the preferences that make up a set
#params: ID of the preference set
#returns all toppings and scores for the preference
get_preferences = "select topping, score from Preference where set_id = %s"

#Get the allergies for a user
#params: username
#returns a list of all allergies that are associated with username
get_allergies = "select topping from Allergy where user = %s"

#Get all toppings that should be considered when creating a pizza
#params: list of usernames, same list of usernames
#returns a list of toppings such that each topping is desired by at least 1 user
# and no user is allergic to any topping.
get_valid_toppings = "select distinct p.topping " \
                     "from Preference_Set ps " \
                     "inner join Preference p on p.set_id = ps.id " \
                     "where ps.user in (%s) and ps.is_active = 1 and p.topping not in " \
                          "(select distinct topping from Allergy where user in (%s)"

#Get the score for toppings in a preference set
#params: Preference set ID, list of toppings
#returns the topping and the score of that topping
get_topping_scores = "select topping, score from Preference where set_id = %s and topping in (%s)"

#Create a new friendship between two users
#params: username of friend1, username of friend2
#inserts a new row in the Friends table. Be sure to run this twice, once for each orientation
new_friends = "insert into Friends values (%s, %s)"

#Get all of the friends of a given user
#params: username
#returns all the users that this user is friends with
get_friends = "select friend2 from Friends where friend1 = %s"

#Calculates the number of orders for a user
#params: username
#returns the number of orders the user has been a part of
get_order_count = "select count(order_id) from Order_Details where user = %s"

#Calculates the user's top toppings
#params: username
#returns a list of toppings ordered by their frequency, and the number of orders they appear in
get_favorite_toppings = "select topping, count(order_id) as frequency from Order_Details where user = %s" \
                        "group by topping order by frequency"

#Calculates the user's best friend
#params: username
#returns a list of people they have ordered a pizza with and the number of orders with that person
get_best_friend = "select count(o1.order_id) as frequency" \
                  "from Order_Details o1 " \
                  "join Order_Details o2 on o1.order_id = o2.order_id" \
                  "where o1.user = %s and o2.user <> o1.user" \
                  "group by o2.user order by frequency"

#Calculates the average group size of a user's orders
#params: username
