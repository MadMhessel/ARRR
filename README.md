# ARRR

## Manual test plan

The application currently relies on interactive workflows, so the following manual checks cover the critical scenarios introduced in the latest iteration:

1. **Wall editing edge cases**
   - Draw a single-segment wall and confirm that vertices can be added, dragged, and removed without errors.
   - Close a polygonal wall, reload the project from local storage, and verify that all vertices remain editable.
   - Load the master template and ensure the auto-generated room walls expose handles and can be adjusted immediately.

2. **Measurement persistence**
   - Add several measurements (with custom titles and notes), refresh the page, and confirm they reappear with their IDs preserved.
   - Export/import a JSON snapshot and verify the measurement list and overlay restore correctly.

3. **Analysis summary accuracy**
   - Configure different normative presets (e.g., гостевой/персонал) and run analysis for layouts with multiple rooms.
   - Check that the sidebar table updates per room, including corridor width status and rotation radius state, after modifying walls or furniture.

4. **CSV export formatting**
   - Run the analysis, export the CSV, and inspect numeric formatting (two decimals for metrics, integer seats, ruble totals).
   - Open the CSV in spreadsheet software to ensure separators and encodings import cleanly (UTF-8, comma delimiter).

5. **Legacy import compatibility**
   - Import a pre-update JSON project (walls stored as SVG paths) and confirm walls convert to editable segments.
   - Import a project with old door/window markup and check that openings snap to the nearest wall segment and follow the wall when moved.
