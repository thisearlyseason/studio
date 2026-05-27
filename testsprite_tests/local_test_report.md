# Local Test Execution Report

- **Total Tests Run**: 34
- **Passed**: 11
- **Failed**: 23
- **Execution Time**: 646.66s

## Summary Table

| Test ID & Name | Status | Duration |
| --- | --- | --- |
| TC001_Sign_up_and_reach_the_dashboard.py | ✅ Passed | 7.42s |
| TC002_Log_in_and_reach_the_dashboard.py | ✅ Passed | 6.56s |
| TC003_Create_a_league_division_and_configure_its_settings.py | ✅ Passed | 10.03s |
| TC004_Sign_up_creates_an_account_and_redirects_to_dashboard.py | ✅ Passed | 26.81s |
| TC005_Create_tournament_divisions_and_assign_teams_in_the_roster.py | ✅ Passed | 11.36s |
| TC006_Filter_league_schedule_and_standings_by_division.py | ✅ Passed | 10.80s |
| TC010_Show_the_locked_division_field_in_a_new_league_form.py | ✅ Passed | 10.22s |
| TC011_Create_a_new_league_registration_form.py | ✅ Passed | 10.61s |
| TC012_Create_a_new_tournament_registration_form.py | ✅ Passed | 10.90s |
| TC015_List_existing_registration_forms_and_add_another_form.py | ✅ Passed | 5.69s |
| TC018_Reject_access_to_protocol_architect_without_signing_in.py | ✅ Passed | 5.69s |
| TC001_Log_in_and_reach_the_dashboard.py | ❌ Failed | 15.56s |
| TC002_Protected_routes_redirect_unauthenticated_users_to_login.py | ❌ Failed | 0.51s |
| TC003_Deep_link_to_protected_page_returns_user_to_intended_page_after_login.py | ❌ Failed | 9.53s |
| TC004_Assign_league_teams_and_generate_a_division_schedule.py | ❌ Failed | 10.77s |
| TC005_View_events_list_while_authenticated.py | ❌ Failed | 42.98s |
| TC006_Open_event_details_and_RSVP_updates_within_details.py | ❌ Failed | 57.79s |
| TC007_Authenticated_session_persists_across_refresh_on_dashboard.py | ❌ Failed | 18.75s |
| TC007_Filter_tournament_itinerary_and_review_division_standings.py | ❌ Failed | 11.02s |
| TC008_Keep_league_division_settings_across_management_views.py | ❌ Failed | 11.64s |
| TC008_RSVP_persists_after_refresh_and_is_reflected_in_listdetails.py | ❌ Failed | 32.67s |
| TC009_Keep_tournament_division_assignments_across_views.py | ❌ Failed | 11.56s |
| TC009_Staff_can_create_a_new_event_and_see_it_in_the_schedule.py | ❌ Failed | 21.59s |
| TC010_Add_a_roster_member_with_required_details.py | ❌ Failed | 45.04s |
| TC011_Toggle_between_calendar_and_list_views_on_events.py | ❌ Failed | 15.74s |
| TC012_View_roster_list_and_open_a_member_profile.py | ❌ Failed | 24.77s |
| TC013_Create_a_league_registration_form_with_the_locked_division_field.py | ❌ Failed | 12.25s |
| TC013_Search_for_a_member_and_edit_member_details.py | ❌ Failed | 51.27s |
| TC014_Open_an_existing_league_protocol_and_view_its_forms.py | ❌ Failed | 16.67s |
| TC014_Remove_a_roster_member_and_show_removed_status.py | ❌ Failed | 21.77s |
| TC015_View_league_standings_and_open_match_details.py | ❌ Failed | 63.17s |
| TC016_Show_validation_when_a_division_name_is_empty.py | ❌ Failed | 10.83s |
| TC017_Prevent_duplicate_division_names.py | ❌ Failed | 10.62s |
| TC019_Reset_league_filters_back_to_the_full_view.py | ❌ Failed | 14.08s |

## Failure Details

### TC001_Log_in_and_reach_the_dashboard.py
- **Duration**: 15.56s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC001_Log_in_and_reach_the_dashboard.py", line 78, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC001_Log_in_and_reach_the_dashboard.py", line 67, in run_test
    assert '/dashboard' in current_url, "The page should have navigated to /dashboard after signing in with valid credentials."
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: The page should have navigated to /dashboard after signing in with valid credentials.

```
### TC002_Protected_routes_redirect_unauthenticated_users_to_login.py
- **Duration**: 0.51s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC002_Protected_routes_redirect_unauthenticated_users_to_login.py", line 58, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC002_Protected_routes_redirect_unauthenticated_users_to_login.py", line 45, in run_test
    assert '/login' in current_url, "The page should have navigated to the login page after attempting to access /events"
           ^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: The page should have navigated to the login page after attempting to access /events

```
### TC003_Deep_link_to_protected_page_returns_user_to_intended_page_after_login.py
- **Duration**: 9.53s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC003_Deep_link_to_protected_page_returns_user_to_intended_page_after_login.py", line 69, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC003_Deep_link_to_protected_page_returns_user_to_intended_page_after_login.py", line 58, in run_test
    assert '/events' in current_url, "The page should have navigated to /events after signing in"
           ^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: The page should have navigated to /events after signing in

```
### TC004_Assign_league_teams_and_generate_a_division_schedule.py
- **Duration**: 10.77s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC004_Assign_league_teams_and_generate_a_division_schedule.py", line 106, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC004_Assign_league_teams_and_generate_a_division_schedule.py", line 77, in run_test
    await elem.wait_for(state="visible", timeout=10000)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 18631, in wait_for
    await self._impl_obj.wait_for(timeout=timeout, state=state)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 723, in wait_for
    await self._frame.wait_for_selector(
        self._selector, strict=True, timeout=timeout, state=state
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 369, in wait_for_selector
    await self._channel.send(
        "waitForSelector", self._timeout, locals_to_params(locals())
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.wait_for: Timeout 10000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div/div/div/div/div[2]/div/main/div/div/div[2]/button").first to be visible


```
### TC005_View_events_list_while_authenticated.py
- **Duration**: 42.98s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC005_View_events_list_while_authenticated.py", line 133, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC005_View_events_list_while_authenticated.py", line 122, in run_test
    assert await frame.locator("xpath=//*[contains(., 'Scheduled events')]").nth(0).is_visible(), "The events page should display Scheduled events after successful login"
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: The events page should display Scheduled events after successful login

```
### TC006_Open_event_details_and_RSVP_updates_within_details.py
- **Duration**: 57.79s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC006_Open_event_details_and_RSVP_updates_within_details.py", line 156, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC006_Open_event_details_and_RSVP_updates_within_details.py", line 128, in run_test
    await asyncio.sleep(3); await elem.click()
                            ^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 16212, in click
    await self._impl_obj.click(
    ...<10 lines>...
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 162, in click
    return await self._frame._click(self._selector, strict=True, **params)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 566, in _click
    await self._channel.send("click", self._timeout, locals_to_params(locals()))
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div[2]/div/div/div/div[2]/main/div/div[2]/div/section/div[3]/button").first


```
### TC007_Authenticated_session_persists_across_refresh_on_dashboard.py
- **Duration**: 18.75s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC007_Authenticated_session_persists_across_refresh_on_dashboard.py", line 84, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC007_Authenticated_session_persists_across_refresh_on_dashboard.py", line 73, in run_test
    assert await frame.locator("xpath=//*[contains(., 'Dashboard')]").nth(0).is_visible(), "The dashboard should be visible after login and page reload."
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: The dashboard should be visible after login and page reload.

```
### TC007_Filter_tournament_itinerary_and_review_division_standings.py
- **Duration**: 11.02s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC007_Filter_tournament_itinerary_and_review_division_standings.py", line 113, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC007_Filter_tournament_itinerary_and_review_division_standings.py", line 78, in run_test
    await elem.wait_for(state="visible", timeout=10000)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 18631, in wait_for
    await self._impl_obj.wait_for(timeout=timeout, state=state)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 723, in wait_for
    await self._frame.wait_for_selector(
        self._selector, strict=True, timeout=timeout, state=state
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 369, in wait_for_selector
    await self._channel.send(
        "waitForSelector", self._timeout, locals_to_params(locals())
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.wait_for: Timeout 10000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div/div/div/div/div[2]/div/main/div/div/div/div[4]/button").first to be visible


```
### TC008_Keep_league_division_settings_across_management_views.py
- **Duration**: 11.64s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC008_Keep_league_division_settings_across_management_views.py", line 131, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC008_Keep_league_division_settings_across_management_views.py", line 78, in run_test
    await elem.wait_for(state="visible", timeout=10000)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 18631, in wait_for
    await self._impl_obj.wait_for(timeout=timeout, state=state)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 723, in wait_for
    await self._frame.wait_for_selector(
        self._selector, strict=True, timeout=timeout, state=state
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 369, in wait_for_selector
    await self._channel.send(
        "waitForSelector", self._timeout, locals_to_params(locals())
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.wait_for: Timeout 10000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div/div/div/div/div[2]/div/main/div/div/div[2]/button").first to be visible


```
### TC008_RSVP_persists_after_refresh_and_is_reflected_in_listdetails.py
- **Duration**: 32.67s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC008_RSVP_persists_after_refresh_and_is_reflected_in_listdetails.py", line 162, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC008_RSVP_persists_after_refresh_and_is_reflected_in_listdetails.py", line 90, in run_test
    await asyncio.sleep(3); await elem.click()
                            ^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 16212, in click
    await self._impl_obj.click(
    ...<10 lines>...
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 162, in click
    return await self._frame._click(self._selector, strict=True, **params)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 566, in _click
    await self._channel.send("click", self._timeout, locals_to_params(locals()))
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div[5]/div/form/div/div[2]/div/a").first


```
### TC009_Keep_tournament_division_assignments_across_views.py
- **Duration**: 11.56s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC009_Keep_tournament_division_assignments_across_views.py", line 208, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC009_Keep_tournament_division_assignments_across_views.py", line 77, in run_test
    await elem.wait_for(state="visible", timeout=10000)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 18631, in wait_for
    await self._impl_obj.wait_for(timeout=timeout, state=state)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 723, in wait_for
    await self._frame.wait_for_selector(
        self._selector, strict=True, timeout=timeout, state=state
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 369, in wait_for_selector
    await self._channel.send(
        "waitForSelector", self._timeout, locals_to_params(locals())
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.wait_for: Timeout 10000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div/div/div/div/div[2]/div/main/div/div/div/div[4]/button").first to be visible


```
### TC009_Staff_can_create_a_new_event_and_see_it_in_the_schedule.py
- **Duration**: 21.59s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC009_Staff_can_create_a_new_event_and_see_it_in_the_schedule.py", line 89, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC009_Staff_can_create_a_new_event_and_see_it_in_the_schedule.py", line 78, in run_test
    assert await frame.locator("xpath=//*[contains(., 'Test Event')]").nth(0).is_visible(), "The new event 'Test Event' should be visible in the events list after saving"
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: The new event 'Test Event' should be visible in the events list after saving

```
### TC010_Add_a_roster_member_with_required_details.py
- **Duration**: 45.04s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC010_Add_a_roster_member_with_required_details.py", line 168, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC010_Add_a_roster_member_with_required_details.py", line 105, in run_test
    await asyncio.sleep(3); await elem.click()
                            ^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 16212, in click
    await self._impl_obj.click(
    ...<10 lines>...
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 162, in click
    return await self._frame._click(self._selector, strict=True, **params)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 566, in _click
    await self._channel.send("click", self._timeout, locals_to_params(locals()))
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div/div/div/div/div/div[2]/div/div/button").first
    - locator resolved to <button type="button" id="radix-_r_3_" data-state="closed" aria-haspopup="menu" aria-expanded="false" class="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground py-2 w-full justify-between h-14 px-3 border-2 border-muted-foregro…>…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-state="open" aria-hidden="true" data-aria-hidden="true" class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"></div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-state="open" aria-hidden="true" data-aria-hidden="true" class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"></div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    10 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div data-state="open" aria-hidden="true" data-aria-hidden="true" class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"></div> intercepts pointer events
     - retrying click action
       - waiting 500ms


```
### TC011_Toggle_between_calendar_and_list_views_on_events.py
- **Duration**: 15.74s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC011_Toggle_between_calendar_and_list_views_on_events.py", line 80, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC011_Toggle_between_calendar_and_list_views_on_events.py", line 69, in run_test
    assert await frame.locator("xpath=//*[contains(., 'Events')]").nth(0).is_visible(), "The events page should display event content in the chosen view after toggling the view mode"
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: The events page should display event content in the chosen view after toggling the view mode

```
### TC012_View_roster_list_and_open_a_member_profile.py
- **Duration**: 24.77s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC012_View_roster_list_and_open_a_member_profile.py", line 96, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC012_View_roster_list_and_open_a_member_profile.py", line 85, in run_test
    assert await frame.locator("xpath=//*[contains(., 'Member Profile')]").nth(0).is_visible(), "The member profile view should be displayed after selecting a roster member"
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: The member profile view should be displayed after selecting a roster member

```
### TC013_Create_a_league_registration_form_with_the_locked_division_field.py
- **Duration**: 12.25s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC013_Create_a_league_registration_form_with_the_locked_division_field.py", line 141, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC013_Create_a_league_registration_form_with_the_locked_division_field.py", line 82, in run_test
    await elem.wait_for(state="visible", timeout=10000)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 18631, in wait_for
    await self._impl_obj.wait_for(timeout=timeout, state=state)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 723, in wait_for
    await self._frame.wait_for_selector(
        self._selector, strict=True, timeout=timeout, state=state
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 369, in wait_for_selector
    await self._channel.send(
        "waitForSelector", self._timeout, locals_to_params(locals())
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.wait_for: Timeout 10000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div/div/div/div/div[2]/div/main/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div[3]/div[2]/button[2]").first to be visible


```
### TC013_Search_for_a_member_and_edit_member_details.py
- **Duration**: 51.27s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC013_Search_for_a_member_and_edit_member_details.py", line 180, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC013_Search_for_a_member_and_edit_member_details.py", line 117, in run_test
    await asyncio.sleep(3); await elem.fill('Test Member Edit')
                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 16552, in fill
    await self._impl_obj.fill(
        value=value, timeout=timeout, noWaitAfter=no_wait_after, force=force
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 215, in fill
    return await self._frame.fill(self._selector, strict=True, **params)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 607, in fill
    await self._fill(**locals_to_params(locals()))
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 619, in _fill
    await self._channel.send("fill", self._timeout, locals_to_params(locals()))
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.fill: Timeout 5000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div[2]/div/div/div/div[2]/main/div/div/div[2]/input").first


```
### TC014_Open_an_existing_league_protocol_and_view_its_forms.py
- **Duration**: 16.67s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC014_Open_an_existing_league_protocol_and_view_its_forms.py", line 123, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC014_Open_an_existing_league_protocol_and_view_its_forms.py", line 77, in run_test
    await elem.click()
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 16212, in click
    await self._impl_obj.click(
    ...<10 lines>...
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 162, in click
    return await self._frame._click(self._selector, strict=True, **params)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 566, in _click
    await self._channel.send("click", self._timeout, locals_to_params(locals()))
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div/div/div/div/div/div[2]/div/div/ul/li[2]/a").first
    - locator resolved to <a href="/club" data-size="default" data-active="false" data-sidebar="menu-button" class="peer/menu-button flex w-full items-center gap-2 overflow-hidden p-2 text-left outline-none ring-sidebar-ring focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:…>…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <html lang="en">…</html> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <html lang="en">…</html> intercepts pointer events
    - retrying click action
      - waiting 100ms
    29 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <html lang="en">…</html> intercepts pointer events
     - retrying click action
       - waiting 500ms


```
### TC014_Remove_a_roster_member_and_show_removed_status.py
- **Duration**: 21.77s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC014_Remove_a_roster_member_and_show_removed_status.py", line 90, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC014_Remove_a_roster_member_and_show_removed_status.py", line 79, in run_test
    assert await frame.locator("xpath=//*[contains(., 'Removed')]").nth(0).is_visible(), "The member profile or roster list should indicate the member is Removed after removal."
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: The member profile or roster list should indicate the member is Removed after removal.

```
### TC015_View_league_standings_and_open_match_details.py
- **Duration**: 63.17s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC015_View_league_standings_and_open_match_details.py", line 191, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC015_View_league_standings_and_open_match_details.py", line 139, in run_test
    await asyncio.sleep(3); await elem.click()
                            ^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 16212, in click
    await self._impl_obj.click(
    ...<10 lines>...
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 162, in click
    return await self._frame._click(self._selector, strict=True, **params)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 566, in _click
    await self._channel.send("click", self._timeout, locals_to_params(locals()))
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div[2]/div/div/div/div[2]/main/div/div[2]/div/section/div[2]/div[5]/div/div[2]/h4").first


```
### TC016_Show_validation_when_a_division_name_is_empty.py
- **Duration**: 10.83s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC016_Show_validation_when_a_division_name_is_empty.py", line 137, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC016_Show_validation_when_a_division_name_is_empty.py", line 78, in run_test
    await elem.wait_for(state="visible", timeout=10000)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 18631, in wait_for
    await self._impl_obj.wait_for(timeout=timeout, state=state)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 723, in wait_for
    await self._frame.wait_for_selector(
        self._selector, strict=True, timeout=timeout, state=state
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 369, in wait_for_selector
    await self._channel.send(
        "waitForSelector", self._timeout, locals_to_params(locals())
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.wait_for: Timeout 10000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div/div/div/div/div[2]/div/main/div/div/div[2]/button").first to be visible


```
### TC017_Prevent_duplicate_division_names.py
- **Duration**: 10.62s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC017_Prevent_duplicate_division_names.py", line 130, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC017_Prevent_duplicate_division_names.py", line 77, in run_test
    await elem.wait_for(state="visible", timeout=10000)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 18631, in wait_for
    await self._impl_obj.wait_for(timeout=timeout, state=state)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 723, in wait_for
    await self._frame.wait_for_selector(
        self._selector, strict=True, timeout=timeout, state=state
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 369, in wait_for_selector
    await self._channel.send(
        "waitForSelector", self._timeout, locals_to_params(locals())
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.wait_for: Timeout 10000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div/div/div/div/div[2]/div/main/div/div/div[2]/button").first to be visible


```
### TC019_Reset_league_filters_back_to_the_full_view.py
- **Duration**: 14.08s
#### Stderr
```
Traceback (most recent call last):
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC019_Reset_league_filters_back_to_the_full_view.py", line 184, in <module>
    asyncio.run(run_test())
    ~~~~~~~~~~~^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 195, in run
    return runner.run(main)
           ~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/asyncio/base_events.py", line 719, in run_until_complete
    return future.result()
           ~~~~~~~~~~~~~^^
  File "/Users/tylerans/.gemini/antigravity/scratch/studio/testsprite_tests/TC019_Reset_league_filters_back_to_the_full_view.py", line 107, in run_test
    await elem.wait_for(state="visible", timeout=10000)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/async_api/_generated.py", line 18631, in wait_for
    await self._impl_obj.wait_for(timeout=timeout, state=state)
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_locator.py", line 723, in wait_for
    await self._frame.wait_for_selector(
        self._selector, strict=True, timeout=timeout, state=state
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_frame.py", line 369, in wait_for_selector
    await self._channel.send(
        "waitForSelector", self._timeout, locals_to_params(locals())
    )
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 69, in send
    return await self._connection.wrap_api_call(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/playwright/_impl/_connection.py", line 559, in wrap_api_call
    raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None
playwright._impl._errors.TimeoutError: Locator.wait_for: Timeout 10000ms exceeded.
Call log:
  - waiting for locator("xpath=/html/body/div[2]/div/div/div/div/div[2]/div/main/div/div[2]/div[2]/div/div[2]/div/div[4]/div[2]/div[3]/div[2]/button[2]").first to be visible


```
